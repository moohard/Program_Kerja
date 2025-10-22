<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KategoriUtama;
use App\Models\ProgramKerja;
use App\Models\RencanaAksi;
use Illuminate\Http\Request;
use App\Exports\LaporanMatriksExport;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;


class ReportController extends Controller
    {

    public function annualSummary(Request $request)
        {
        $validated = $request->validate([
            'program_kerja_id' => 'required|integer|exists:program_kerja,id',
        ]);

        $programKerjaId = $validated['program_kerja_id'];

        // 1. Summary Stats
        $summary = RencanaAksi::whereHas('kegiatan.kategoriUtama', fn($q) => $q->where('program_kerja_id', $programKerjaId))
            ->select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status');

        // 2. Progress by Category
        $progressByCategory = KategoriUtama::where('program_kerja_id', $programKerjaId)
            ->where('is_active', TRUE)
            ->with(['kegiatan.rencanaAksi.progressMonitorings']) // [FIX] Eager load the relationship needed by the accessor
            ->orderBy('nomor')
            ->get()
            ->map(function ($kategori) {
                $allAksi = $kategori->kegiatan->flatMap(fn($kg) => $kg->rencanaAksi);

                if ($allAksi->isEmpty()) {
                    return NULL;
                }

                // [FIX] Use the accurate 'overall_progress' accessor instead of 'latestProgress'
                $totalProgress = $allAksi->sum(function($aksi) {
                    return $aksi->overall_progress_percentage; // Use the correct accessor name
                });

                $aksiCount = $allAksi->count();
                $averageProgress = $aksiCount > 0 ? round($totalProgress / $aksiCount, 2) : 0;

                return [
                    'category_name'    => "{$kategori->nomor}. {$kategori->nama_kategori}",
                    'average_progress' => $averageProgress,
                ];
            })
            ->filter()->values();

        // 3. Achievement Highlights (contoh: 5 prioritas tinggi yang sudah selesai)
        $highlights = RencanaAksi::whereHas('kegiatan.kategoriUtama', fn($q) => $q->where('program_kerja_id', $programKerjaId))
            ->where('status', 'completed')
            ->where('priority', 'high')
            ->with('kegiatan:id,nama_kegiatan')
            ->limit(5)
            ->get(['id', 'deskripsi_aksi', 'kegiatan_id']);

        return response()->json([
            'summary'              => $summary,
            'progress_by_category' => $progressByCategory,
            'highlights'           => $highlights,
        ]);
        }


    public function monthly(Request $request)
        {
        $request->validate([
            'year'  => 'required|integer|digits:4',
            'month' => 'required|integer|min:1|max:12',
        ]);

        $year  = $request->year;
        $month = (int) $request->month;

        $programKerja = ProgramKerja::where('tahun', $year)->first();

        if (!$programKerja) {
            return response()->json(['data' => []]);
            }

        // 1. Ambil semua RencanaAksi untuk bulan tersebut secara langsung
        $rencanaAksis = RencanaAksi::whereHas('kegiatan.kategoriUtama', fn($q) => $q->where('program_kerja_id', $programKerja->id))
            ->whereYear('target_tanggal', $year) // [FIX] Filter berdasarkan tahun target
            ->where(function ($q) use ($month) {
                $q->whereIn('jadwal_tipe', ['periodik', 'bulanan', 'insidentil'])
                    ->whereJsonContains('jadwal_config->months', $month);
            })
            ->with([
                            'kegiatan.kategoriUtama:id,nomor,nama_kategori',
                            'assignedTo:id,name',
                        ])
                        ->get();
                
                    // 3. Kelompokkan berdasarkan Kategori Utama
                    $groupedByKategori = $rencanaAksis->groupBy('kegiatan.kategoriUtama.nama_kategori');
                
                    // 4. Ubah data untuk frontend
                    $reportData = $groupedByKategori->map(function ($items, $kategoriName) use ($year, $month) {
                        if ($items->isEmpty()) {
                            return null;
                        }
                        $firstItem = $items->first();
                        $kategori = $firstItem->kegiatan->kategoriUtama;
                
                        return [
                            'id' => $kategori->id,
                            'nomor' => $kategori->nomor,
                            'nama_kategori' => $kategoriName,
                            'kegiatan' => $items->groupBy('kegiatan.nama_kegiatan')->map(function ($kegiatanItems) use ($year, $month) {
                                return [
                                    'nama_kegiatan' => $kegiatanItems->first()->kegiatan->nama_kegiatan,
                                    'rencana_aksi' => $kegiatanItems->map(function ($ra) use ($year, $month) {
                                        $monthlyProgress = \App\Models\ProgressMonitoring::where('rencana_aksi_id', $ra->id)
                                            ->whereYear('report_date', $year)
                                            ->whereMonth('report_date', $month)
                                            ->latest('tanggal_monitoring')
                                            ->first();
                
                                        return [
                                            'id' => $ra->id,
                                            'deskripsi_aksi' => $ra->deskripsi_aksi,
                                            'status' => $ra->status,
                                            'target_tanggal_formatted' => $ra->target_tanggal ? \Carbon\Carbon::parse($ra->target_tanggal)->isoFormat('D MMMM YYYY') : 'N/A',
                                            'assigned_to' => $ra->assignedTo,
                                            'progress' => $monthlyProgress->progress_percentage ?? 0,
                                        ];
                                    })->values()
                                ];
                            })->values()
                        ];
                    })->filter()->sortBy('nomor')->values();        return response()->json(['data' => $reportData]);
        }

    private function getMatrixReportData(Request $request)
        {
        $request->validate([
            'year' => 'required|integer',
        ]);
        $year = $request->year;

        $rencanaAksis = RencanaAksi::whereYear('target_tanggal', $year)
            ->with([
                'kegiatan.kategoriUtama',
                'assignedTo:id,name',
                'progressMonitorings' => function ($query) use ($year) {
                    $query->whereYear('report_date', $year);
                }
            ])
            ->get();

        if ($rencanaAksis->isEmpty()) {
            return collect();
        }

        $processedData = $rencanaAksis->map(function ($aksi) {
            $kategoriNama = optional($aksi->kegiatan->kategoriUtama)->nama_kategori ?? 'Uncategorized';

            $monthlyProgress = collect(range(1, 12))->mapWithKeys(function ($month) use ($aksi) {
                if (empty($aksi->target_months) || !in_array($month, $aksi->target_months)) {
                    return [$month => null]; // Not scheduled
                }

                $latestProgressForMonth = $aksi->progressMonitorings
                    ->filter(fn($pm) => \Carbon\Carbon::parse($pm->report_date)->month == $month)
                    ->sortByDesc('tanggal_monitoring')
                    ->first();

                return [$month => $latestProgressForMonth->progress_percentage ?? 0]; // Scheduled but no progress
            });

            return [
                'id'               => $aksi->id,
                'deskripsi_aksi'   => $aksi->deskripsi_aksi,
                'catatan'          => $aksi->catatan,
                'status'           => $aksi->status,
                'is_late'          => $aksi->status !== 'completed' && $aksi->target_tanggal?->isPast(),
                'kegiatan'         => [
                    'nama_kegiatan' => $aksi->kegiatan->nama_kegiatan,
                    'kategori'      => [
                        'nama_kategori' => $kategoriNama,
                        'nomor'         => optional($aksi->kegiatan->kategoriUtama)->nomor ?? 0,
                    ],
                ],
                'assigned_to'      => $aksi->assignedTo,
                'jadwal_config'    => $aksi->jadwal_config,
                'target_tanggal'   => $aksi->target_tanggal,
                'monthly_progress' => $monthlyProgress,
            ];
        });

        return $processedData->groupBy('kegiatan.kategori.nama_kategori');
    }

    // --- FUNGSI LAMA ANDA UNTUK MENAMPILKAN LAPORAN MATRIKS (SEKARANG LEBIH RINGKAS) ---
    public function matrix(Request $request)
        {

        $data = $this->getMatrixReportData($request);
        return response()->json($data);
        }

    // --- FUNGSI EKSPOR BARU YANG DIINTEGRASIKAN ---
    public function exportMatrix(Request $request)
        {

        $request->validate([
            'year'   => 'required|integer',
            'format' => 'required|in:excel,pdf',
        ]);

        $year = $request->year;

        if ($request->format === 'excel') {
            $rencanaAksis = RencanaAksi::whereYear('target_tanggal', $year)
                ->with(['kegiatan.kategoriUtama', 'assignedTo:id,name', 'progressMonitorings' => fn($q) => $q->whereYear('report_date', $year)])
                ->get();
            $fileName     = "Laporan_Matriks_{$year}.xlsx";
            return Excel::download(new LaporanMatriksExport($rencanaAksis), $fileName);
            }

        if ($request->format === 'pdf') {
            // 1. Ambil data mentah
            $rencanaAksis = RencanaAksi::whereYear('target_tanggal', $year)
                ->with(['kegiatan.kategoriUtama', 'assignedTo:id,name', 'progressMonitorings' => fn($q) => $q->whereYear('report_date', $year)])
                ->orderBy('kegiatan_id') // Urutkan untuk grouping
                ->get();

            // 2. Proses dan kelompokkan data untuk view PDF
            $groupedData = $rencanaAksis->groupBy(function ($item) {
                return optional($item->kegiatan->kategoriUtama)->nama_kategori ?? 'Uncategorized';
                })->map(function ($kategoriGroup) {
                    return $kategoriGroup->groupBy('kegiatan.nama_kegiatan')
                        ->map(function ($kegiatanGroup) {
                            return [
                                'nama_kegiatan' => $kegiatanGroup->first()->kegiatan->nama_kegiatan,
                                'rencana_aksi'  => $kegiatanGroup->map(function ($aksi) {
                                    $monthlyProgress = $aksi->progressMonitorings->mapWithKeys(function ($progress) use ($aksi) {
                                        return [(int) date('m', strtotime($progress->report_date)) => $progress->progress_percentage];
                                        });
                                    return [
                                        'deskripsi_aksi'   => $aksi->deskripsi_aksi,
                                        'assigned_to'      => $aksi->assignedTo,
                                        'target_tanggal'   => $aksi->target_tanggal,
                                        'monthly_progress' => $monthlyProgress,
                                    ];
                                    })->values()->all(),
                            ];
                            })->values()->all();
                    });

            // 3. Buat PDF
            $pdf = Pdf::loadView('reports.matriks_pdf', ['data' => $groupedData, 'year' => $year])
                ->setPaper('a3', 'landscape');

            // 4. Simpan ke S3 dan dapatkan URL
            $fileName = 'generated-reports/laporan-matriks-' . $year . '-' . Str::uuid() . '.pdf';
            Storage::disk('s3')->put($fileName, $pdf->output());

            $url = Storage::disk('s3')->temporaryUrl(
                $fileName,
                now()->addMinutes(15) // URL berlaku selama 15 menit
            );

            return response()->json(['download_url' => $url]);
            }
        }

    public function exportAnnualSummary(Request $request)
        {
        $validated = $request->validate([
            'program_kerja_id' => 'required|integer|exists:program_kerja,id',
            'format'           => 'required|in:pdf',
        ]);

        $programKerjaId = $validated['program_kerja_id'];
        $programKerja   = ProgramKerja::findOrFail($programKerjaId);

        // 1. Summary Stats
        $summary = RencanaAksi::whereHas('kegiatan.kategoriUtama', fn($q) => $q->where('program_kerja_id', $programKerjaId))
            ->select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status');

        // 2. Progress by Category
        $progressByCategory = KategoriUtama::where('program_kerja_id', $programKerjaId)
            ->where('is_active', TRUE)
            ->with(['kegiatan.rencanaAksi.latestProgress'])
            ->orderBy('nomor')
            ->get()
            ->map(function ($kategori) {
                $allAksi = $kategori->kegiatan->flatMap(fn($kg) => $kg->rencanaAksi);
                if ($allAksi->isEmpty()) {
                    return NULL;
                    }
                $totalProgress = $allAksi->sum(fn($aksi) => $aksi->latestProgress->progress_percentage ?? 0);
                return [
                    'category_name'    => "{$kategori->nomor}. {$kategori->nama_kategori}",
                    'average_progress' => round($totalProgress / $allAksi->count(), 2),
                ];
                })
            ->filter()->values();

        // 3. Achievement Highlights
        $highlights = RencanaAksi::whereHas('kegiatan.kategoriUtama', fn($q) => $q->where('program_kerja_id', $programKerjaId))
            ->where('status', 'completed')
            ->where('priority', 'high')
            ->with('kegiatan:id,nama_kegiatan')
            ->limit(5)
            ->get(['id', 'deskripsi_aksi', 'kegiatan_id']);

        $data = [
            'programKerja'       => $programKerja,
            'summary'            => $summary,
            'progressByCategory' => $progressByCategory,
            'highlights'         => $highlights,
        ];

        $pdf = Pdf::loadView('reports.annual_summary_pdf', $data)
            ->setPaper('a4', 'portrait');

        $fileName = 'generated-reports/laporan-tahunan-' . $programKerja->tahun . '-' . Str::uuid() . '.pdf';
        Storage::disk('s3')->put($fileName, $pdf->output());

        $url = Storage::disk('s3')->temporaryUrl(
            $fileName,
            now()->addMinutes(15),
        );

        return response()->json(['download_url' => $url]);
        }
    }
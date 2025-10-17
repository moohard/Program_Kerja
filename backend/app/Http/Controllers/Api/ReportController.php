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
            ->where('is_active', true)
            ->with(['kegiatan.rencanaAksi.latestProgress'])
            ->orderBy('nomor')
            ->get()
            ->map(function ($kategori) {
                $allAksi = $kategori->kegiatan->flatMap(fn($kg) => $kg->rencanaAksi);
                if ($allAksi->isEmpty()) {
                    return null;
                }
                $totalProgress = $allAksi->sum(fn($aksi) => $aksi->latestProgress->progress_percentage ?? 0);
                return [
                    'category_name' => "{$kategori->nomor}. {$kategori->nama_kategori}",
                    'average_progress' => round($totalProgress / $allAksi->count(), 2),
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
            'summary' => $summary,
            'progress_by_category' => $progressByCategory,
            'highlights' => $highlights,
        ]);
    }


    public function monthly(Request $request)
    {
        $request->validate([
            'year'  => 'required|integer|digits:4',
            'month' => 'required|integer|min:1|max:12',
        ]);

        $year  = $request->year;
        $month = (int)$request->month;

        $programKerja = ProgramKerja::where('tahun', $year)->first();

        if (!$programKerja) {
            return response()->json(['data' => []]);
        }

        // Ambil semua kategori dan relasi rencana aksi-nya
        $reportData = KategoriUtama::where('program_kerja_id', $programKerja->id)
            ->where('is_active', TRUE)
            ->with([
                'kegiatan.rencanaAksi' => function ($query) use ($month, $year) {
                    $query->where(function ($q) use ($month) {
                        $q->whereIn('jadwal_tipe', ['periodik', 'bulanan', 'insidentil'])
                         ->whereJsonContains('jadwal_config->months', (int)$month);
                    })->with(['assignedTo:id,name', 'latestProgress']);
                }
            ])
            ->orderBy('nomor', 'asc')
            ->get();

        // Filter kategori yang tidak memiliki rencana aksi sama sekali di bulan tsb agar tidak ditampilkan
        $filteredReportData = $reportData->filter(function ($kategori) {
            return $kategori->kegiatan->some(fn($kg) => $kg->rencanaAksi->isNotEmpty());
        })->values();

        return response()->json(['data' => $filteredReportData]);
    }

    private function getMatrixReportData(Request $request)
        {
        $request->validate([
            'year' => 'required|integer',
        ]);
        $year = $request->year;

        // [FIX] - Gunakan eager loading dengan relasi yang benar
        $rencanaAksis = RencanaAksi::whereYear('target_tanggal', $year)
            ->with([
                'kegiatan.kategoriUtama', // Pastikan relasi ini bekerja
                'assignedTo:id,name',
                'progressMonitorings' => function ($query) use ($year) {
                    $query->whereYear('report_date', $year);
                    }
            ])
            ->get();

        // [DEBUG] - Cek data yang diambil
        if ($rencanaAksis->isEmpty()) {
            logger()->warning('No RencanaAksi found for year: ' . $year);
            return collect();
            }

        return $rencanaAksis->map(function ($aksi) {
            // [FIX] - Pastikan kategori ada
            $kategoriNama = optional($aksi->kegiatan->kategoriUtama)->nama_kategori
                ?? 'Uncategorized';

            $monthlyProgress = $aksi->progressMonitorings->mapWithKeys(function ($progress) {
                $month = (int) date('m', strtotime($progress->report_date));
                return [$month => $progress->progress_percentage];
                });

            return [
                'id'               => $aksi->id,
                'deskripsi_aksi'   => $aksi->deskripsi_aksi,
                'catatan'          => $aksi->catatan,
                'status'           => $aksi->status,
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
            })
            ->groupBy('kegiatan.kategori.nama_kategori');
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
            $fileName = "Laporan_Matriks_{$year}.xlsx";
            return Excel::download(new LaporanMatriksExport($rencanaAksis), $fileName);
        }

        if ($request->format === 'pdf') {
            // 1. Ambil data mentah
            $rencanaAksis = RencanaAksi::whereYear('target_tanggal', $year)
                ->with(['kegiatan.kategoriUtama', 'assignedTo:id,name', 'progressMonitorings' => fn($q) => $q->whereYear('report_date', $year)])
                ->orderBy('kegiatan_id') // Urutkan untuk grouping
                ->get();

            // 2. Proses dan kelompokkan data untuk view PDF
            $groupedData = $rencanaAksis->groupBy(function($item) {
                return optional($item->kegiatan->kategoriUtama)->nama_kategori ?? 'Uncategorized';
            })->map(function($kategoriGroup) {
                return $kategoriGroup->groupBy('kegiatan.nama_kegiatan')
                    ->map(function($kegiatanGroup) {
                        return [
                            'nama_kegiatan' => $kegiatanGroup->first()->kegiatan->nama_kegiatan,
                            'rencana_aksi' => $kegiatanGroup->map(function($aksi) {
                                $monthlyProgress = $aksi->progressMonitorings->mapWithKeys(function ($progress) {
                                    return [(int)date('m', strtotime($progress->report_date)) => $progress->progress_percentage];
                                });
                                return [
                                    'deskripsi_aksi' => $aksi->deskripsi_aksi,
                                    'assigned_to' => $aksi->assignedTo,
                                    'target_tanggal' => $aksi->target_tanggal,
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
}
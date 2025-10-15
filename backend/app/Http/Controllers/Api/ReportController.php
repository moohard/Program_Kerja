<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KategoriUtama;
use App\Models\ProgramKerja;
use App\Models\RencanaAksi;
use Illuminate\Http\Request;
use App\Exports\LaporanMatriksExport; // <-- Tambahkan ini
use Maatwebsite\Excel\Facades\Excel;

class ReportController extends Controller
    {

    public function monthly(Request $request)
        {

        $request->validate([
            'year'  => 'required|integer|digits:4',
            'month' => 'required|integer|min:1|max:12',
        ]);

        $year  = $request->year;
        $month = $request->month;

        // Cari program kerja berdasarkan tahun yang dipilih
        $programKerja = ProgramKerja::where('tahun', $year)->first();

        if (!$programKerja) {
            return response()->json(['data' => []]); // Jika tidak ada program kerja di tahun tsb, kembalikan data kosong
            }

        // Ambil semua kategori dan relasi rencana aksi-nya
        $reportData = KategoriUtama::where('program_kerja_id', $programKerja->id)
            ->where('is_active', TRUE)
            ->with([
                    'kegiatan.rencanaAksi' => function ($query) use ($month, $year) {
                        // Filter rencana aksi yang targetnya ada di bulan dan tahun yang dipilih
                        $query->whereMonth('target_tanggal', $month)
                            ->whereYear('target_tanggal', $year)
                            ->with(['assignedTo:id,name', 'latestProgress']);
                        }
                ])
            ->orderBy('nomor', 'asc')
            ->get();

        // Filter kategori yang tidak memiliki rencana aksi sama sekali di bulan tsb agar tidak ditampilkan
        $filteredReportData = $reportData->filter(function ($kategori) {
            foreach ($kategori->kegiatan as $kegiatan) {
                if ($kegiatan->rencanaAksi->isNotEmpty()) {
                    return TRUE;
                    }
                }

            return FALSE;
            })->values(); // `values()` untuk mereset key array setelah filter

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
            'format' => 'required|in:excel',
        ]);

        // Menggunakan kembali fungsi pengambilan data yang sama
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

        $fileName = "Laporan_Matriks_{$request->year}.xlsx";

        return Excel::download(new LaporanMatriksExport($rencanaAksis), $fileName);
        }

    }
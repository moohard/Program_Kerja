<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KategoriUtama;
use App\Models\ProgramKerja;
use App\Models\RencanaAksi;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function monthly(Request $request)
    {
        $request->validate([
            'year' => 'required|integer|digits:4',
            'month' => 'required|integer|min:1|max:12',
        ]);

        $year = $request->year;
        $month = $request->month;

        // Cari program kerja berdasarkan tahun yang dipilih
        $programKerja = ProgramKerja::where('tahun', $year)->first();

        if (!$programKerja) {
            return response()->json(['data' => []]); // Jika tidak ada program kerja di tahun tsb, kembalikan data kosong
        }

        // Ambil semua kategori dan relasi rencana aksi-nya
        $reportData = KategoriUtama::where('program_kerja_id', $programKerja->id)
            ->where('is_active', true)
            ->with(['kegiatan.rencanaAksi' => function ($query) use ($month, $year) {
                // Filter rencana aksi yang targetnya ada di bulan dan tahun yang dipilih
                $query->whereMonth('target_tanggal', $month)
                      ->whereYear('target_tanggal', $year)
                      ->with(['assignedUser:id,name', 'latestProgress']);
            }])
            ->orderBy('nomor', 'asc')
            ->get();

        // Filter kategori yang tidak memiliki rencana aksi sama sekali di bulan tsb agar tidak ditampilkan
        $filteredReportData = $reportData->filter(function ($kategori) {
            foreach ($kategori->kegiatan as $kegiatan) {
                if ($kegiatan->rencanaAksi->isNotEmpty()) {
                    return true;
                }
            }
            return false;
        })->values(); // `values()` untuk mereset key array setelah filter

        return response()->json(['data' => $filteredReportData]);
    }
    public function matrix(Request $request)
    {
        $request->validate([
            'year' => 'required|integer|min:2020|max:2099',
        ]);

        $year = $request->input('year');

        // Mengambil semua Rencana Aksi yang target tahunnya adalah tahun yang dipilih
        $rencanaAksi = RencanaAksi::with(['kegiatan.kategoriUtama', 'assignedTo:id,name'])
            ->whereYear('target_tanggal', $year) // Filter awal berdasarkan tahun
            ->whereHas('kegiatan.kategoriUtama', function ($query) {
                $query->where('is_active', true);
            })
            ->orderBy('kegiatan_id')
            ->get();
            
        // Mengubah data menjadi format yang diinginkan oleh frontend
        $groupedData = [];
        foreach ($rencanaAksi as $aksi) {
            $kategori = $aksi->kegiatan->kategoriUtama;
            $kegiatan = $aksi->kegiatan;

            if (!isset($groupedData[$kategori->id])) {
                $groupedData[$kategori->id] = [
                    'kategori_id' => $kategori->id,
                    'kategori_nomor' => $kategori->nomor,
                    'kategori_nama' => $kategori->nama_kategori,
                    'kegiatan' => [],
                ];
            }

            if (!isset($groupedData[$kategori->id]['kegiatan'][$kegiatan->id])) {
                $groupedData[$kategori->id]['kegiatan'][$kegiatan->id] = [
                    'kegiatan_id' => $kegiatan->id,
                    'kegiatan_nama' => $kegiatan->nama_kegiatan,
                    'rencana_aksi' => [],
                ];
            }

            // <-- LOGIKA JADWAL BARU -->
            $scheduledMonths = $aksi->jadwal_config['months'] ?? [];
            
            // Fallback untuk data lama yang belum punya jadwal_config
            if (empty($scheduledMonths)) {
                $scheduledMonths = [(int) date('m', strtotime($aksi->target_tanggal))];
            }
            
            $schedule = [];
            for ($i = 1; $i <= 12; $i++) {
                // Jika bulan ini ada dalam jadwal, tampilkan statusnya
                $schedule[$i] = in_array($i, $scheduledMonths) ? $aksi->status : null;
            }
            // <-- AKHIR LOGIKA JADWAL BARU -->

            $groupedData[$kategori->id]['kegiatan'][$kegiatan->id]['rencana_aksi'][] = [
                'id' => $aksi->id,
                'deskripsi' => $aksi->deskripsi_aksi,
                'target' => '100',
                'output' => $aksi->catatan ?? 'Dokumen Kegiatan',
                'penanggung_jawab' => $aksi->assignedTo->name ?? '-',
                'terlaksana' => $aksi->status === 'completed' ? 'Terlaksana' : 'Belum Terlaksana',
                'schedule_time' => $schedule,
            ];
        }

        // Membersihkan keys agar menjadi array standar
        $finalData = array_values(array_map(function ($kategori) {
            $kategori['kegiatan'] = array_values($kategori['kegiatan']);
            return $kategori;
        }, $groupedData));
        
        return response()->json($finalData);
    }
}
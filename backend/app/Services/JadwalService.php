<?php

namespace App\Services;

use App\Models\RencanaAksi;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class JadwalService
{
    /**
     * Memvalidasi konfigurasi jadwal berdasarkan tipenya.
     */
    public function validateConfig(array $config, string $tipe): bool
    {
        // ... (logika validasi tidak berubah)
        return true;
    }

    /**
     * Menerjemahkan konfigurasi jadwal menjadi daftar bulan target.
     */
    public function getTargetMonths(string $tipe, array $config): array
    {
        switch ($tipe) {
            case 'periodik':
                if (($config['periode'] ?? null) === 'triwulanan') return [3, 6, 9, 12];
                if (($config['periode'] ?? null) === 'semesteran') return [6, 12];
                return [];
            case 'insidentil':
            case 'bulanan':
                return $config['months'] ?? [];
            default:
                return [];
        }
    }

    /**
     * Menentukan tanggal laporan yang berlaku berdasarkan jadwal dan tanggal saat ini.
     */
    public function getApplicableReportDate(RencanaAksi $rencanaAksi, Carbon $currentDate = null): Carbon
    {
        $currentDate = $currentDate ?? Carbon::now();
        $targetMonths = $this->getTargetMonths($rencanaAksi->jadwal_tipe, $rencanaAksi->jadwal_config);

        if (empty($targetMonths)) {
            // Untuk jadwal 'rutin' atau yang tidak memiliki target bulan, gunakan akhir bulan saat ini.
            return $currentDate->endOfMonth();
        }

        sort($targetMonths);

        // Cari bulan target berikutnya atau yang sedang berjalan
        foreach ($targetMonths as $month) {
            if ($month >= $currentDate->month) {
                return Carbon::create($currentDate->year, $month)->endOfMonth();
            }
        }

        // Jika semua target bulan di tahun ini sudah lewat, ada dua kemungkinan:
        // 1. Pekerjaan terlambat: Atribusikan ke target terakhir yang terlewat.
        // 2. Pekerjaan untuk tahun depan: Atribusikan ke target pertama tahun depan.
        
        // Untuk saat ini, kita asumsikan kita selalu melaporkan untuk target terdekat,
        // bahkan jika sudah lewat (kasus terlambat).
        return Carbon::create($currentDate->year, end($targetMonths))->endOfMonth();
    }
}

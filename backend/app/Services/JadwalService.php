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
                if (($config['interval'] ?? null) === 'quarterly') return [3, 6, 9, 12];
                if (($config['interval'] ?? null) === 'biannual') return [6, 12];
                // Fallback untuk format lama jika masih ada
                if (($config['periode'] ?? null) === 'triwulanan') return [3, 6, 9, 12];
                if (($config['periode'] ?? null) === 'semesteran') return [6, 12];
                return $config['months'] ?? []; // Menangani periodik dengan bulan kustom
            case 'insidentil':
            case 'bulanan':
                return $config['months'] ?? [];
            default:
                return [];
        }
    }

    /**
     * Menentukan tanggal laporan yang berlaku berdasarkan jadwal dan tanggal saat ini.
     *
     * @param RencanaAksi $rencanaAksi
     * @param Carbon|null $currentDate Tanggal saat ini (untuk testing atau kasus spesifik)
     * @param int|null $contextMonth Bulan spesifik yang menjadi konteks (misalnya dari filter UI)
     * @return Carbon
     */
    public function getApplicableReportDate(RencanaAksi $rencanaAksi, Carbon $currentDate = null, ?int $contextMonth = null): Carbon
    {
        $currentDate = $currentDate ?? Carbon::now();
        $year = $currentDate->year;
        $targetMonths = $this->getTargetMonths($rencanaAksi->jadwal_tipe, $rencanaAksi->jadwal_config);

        if (empty($targetMonths)) {
            // Untuk jadwal 'rutin', gunakan akhir bulan dari konteks jika ada, jika tidak gunakan bulan saat ini.
            return Carbon::create($year, $contextMonth ?? $currentDate->month)->endOfMonth();
        }

        sort($targetMonths);

        // Prioritaskan bulan dari konteks (filter UI) untuk perbandingan
        $monthToCompare = $contextMonth ?? $currentDate->month;

        // Cari bulan target berikutnya atau yang sedang berjalan dari konteks
        foreach ($targetMonths as $month) {
            if ($month >= $monthToCompare) {
                return Carbon::create($year, $month)->endOfMonth();
            }
        }
        
        // Jika semua target bulan di tahun ini sudah lewat, atribusikan ke target terakhir.
        return Carbon::create($year, end($targetMonths))->endOfMonth();
    }
}

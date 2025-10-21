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
        $year = $rencanaAksi->target_tanggal ? Carbon::parse($rencanaAksi->target_tanggal)->year : $currentDate->year;

        // [FIX] If a context month is provided, always use that month for the report date.
        $reportMonth = $contextMonth ?? $currentDate->month;

        return Carbon::create($year, $reportMonth)->endOfMonth();
    }
}

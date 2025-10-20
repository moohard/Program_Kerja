<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

use App\Services\JadwalService;

class RencanaAksi extends Model
{
    use HasFactory;

    protected $table = 'rencana_aksi';

    protected $fillable = [
        'kegiatan_id',
        'nomor_aksi',
        'deskripsi_aksi',
        'status',
        'target_tanggal',
        'actual_tanggal',
        'catatan',
        'assigned_to',
        'jadwal_tipe',
        'jadwal_config',
        'priority',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = ['target_months'];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'target_tanggal' => 'date',
        'actual_tanggal' => 'date',
        'jadwal_config'  => 'array',
    ];

    /**
     * Get the target months for reporting based on the schedule.
     *
     * @return \Illuminate\Database\Eloquent\Casts\Attribute
     */
    public function targetMonths(): Attribute
    {
        return Attribute::make(
            get: function () {
                if (!$this->jadwal_tipe) {
                    return [];
                }
                $jadwalService = app(JadwalService::class);
                return $jadwalService->getTargetMonths($this->jadwal_tipe, $this->jadwal_config ?? []);
            }
        );
    }


    public function kegiatan()
    {

        return $this->belongsTo(Kegiatan::class);
    }


    public function assignedTo()
    {

        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function todoItems()
    {

        return $this->hasMany(TodoItem::class);
    }

    public function progressMonitorings()
    {
        return $this->hasMany(ProgressMonitoring::class, 'rencana_aksi_id')->orderBy('tanggal_monitoring', 'desc');
    }

    public function latestProgress()
    {
        // Menambahkan 'id' sebagai tie-breaker jika tanggal_monitoring identik
        return $this->hasOne(ProgressMonitoring::class, 'rencana_aksi_id')->latestOfMany(['tanggal_monitoring', 'id']);
    }

    /**
     * [NEW] Accessor untuk menghitung rata-rata progress dari semua bulan target.
     */
    protected function overallProgressPercentage(): Attribute
    {
        return Attribute::make(
            get: function () {
                $targetMonths = $this->target_months;

                // Jika tidak ada bulan target (misal: tahunan), gunakan progress terakhir.
                if (empty($targetMonths)) {
                    return $this->latestProgress?->progress_percentage ?? 0;
                }

                // Ambil semua progress yang relevan sekaligus untuk efisiensi
                $progresses = $this->progressMonitorings->keyBy(function ($item) {
                    return \Carbon\Carbon::parse($item->report_date)->month;
                });

                $totalPercentage = 0;
                foreach ($targetMonths as $month) {
                    $totalPercentage += $progresses[$month]->progress_percentage ?? 0;
                }

                return round($totalPercentage / count($targetMonths));
            }
        );
    }

    /**
     * [FIX] - Accessor untuk mendapatkan nilai progress terakhir.
     * Ini akan menghitung nilai progress terakhir dari relasi latestProgress.
     *
     * @return \Illuminate\Database\Eloquent\Casts\Attribute
     */
    protected function latestProgressPercentage(): Attribute
    {

        return Attribute::make(
            get: fn() => $this->latestProgress?->progress_percentage ?? 0,
        );
    }

}

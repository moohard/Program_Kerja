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
        return $this->hasOne(ProgressMonitoring::class, 'rencana_aksi_id')->latest('tanggal_monitoring');
    }

    /**
     * [NEW] Accessor untuk menghitung rata-rata progress dari semua bulan target.
     */
    protected function overallProgressPercentage(): Attribute
    {
        return Attribute::make(
            get: function () {
                // [FIX] Force-reload the relationship to ensure it's not stale
                $this->load('progressMonitorings');
                
                $targetMonths = $this->target_months;

                if (empty($targetMonths)) {
                    return $this->latestProgress?->progress_percentage ?? 0;
                }
    
                // Ambil progress TERBARU untuk setiap bulan target
                $progresses = $this->getRelationValue('progressMonitorings')
                    ->groupBy(function ($item) {
                        return \Carbon\Carbon::parse($item->report_date)->month;
                    })
                    ->map(function ($monthGroup) {
                        return $monthGroup->sortByDesc('tanggal_monitoring')->first();
                    });
    
                $totalPercentage = 0;
                
                foreach ($targetMonths as $month) {
                    // Beri 0% untuk bulan yang belum ada progress-nya
                    $progressForMonth = $progresses[$month]->progress_percentage ?? 0;
                    $totalPercentage += $progressForMonth;
                }
    
                // Selalu bagi dengan jumlah total bulan target
                if (count($targetMonths) === 0) return 0; // Hindari division by zero
                $finalAverage = round($totalPercentage / count($targetMonths));
                
                return $finalAverage;
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

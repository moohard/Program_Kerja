<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'target_tanggal' => 'date', // Pastikan ini ada
        'actual_tanggal' => 'date', // Pastikan ini ada
        'jadwal_config'  => 'array', // <-- Tambahkan baris ini
    ];

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

    // Juga tambahkan relationship latestProgress jika diperlukan
    public function latestProgress()
        {
        return $this->hasOne(ProgressMonitoring::class, 'rencana_aksi_id')->latestOfMany();
        }
    }
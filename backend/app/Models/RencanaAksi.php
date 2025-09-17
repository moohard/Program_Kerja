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

    protected $casts = [
        'target_tanggal' => 'date',
        'actual_tanggal' => 'date',
        'jadwal_config'  => 'array',
    ];

    public function kegiatan()
    {

        return $this->belongsTo(Kegiatan::class);
    }

    public function assignedUser()
    {

        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function todoItems()
    {

        return $this->hasMany(TodoItem::class);
    }

    public function progressMonitoring()
    {

        return $this->hasMany(ProgressMonitoring::class,'rencana_aksi_id');
    }

    public function latestProgress()
    {

        return $this->hasOne(ProgressMonitoring::class)->latestOfMany();
    }

}

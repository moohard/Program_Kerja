<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProgressMonitoring extends Model
{

    use HasFactory;

    protected $table = 'progress_monitoring';

    protected $fillable = [
        'rencana_aksi_id',
        'progress_percentage',
        'keterangan',
        'tanggal_monitoring',
        'report_date',

    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'tanggal_monitoring' => 'date',
        'report_date'        => 'date',
        'created_at'         => 'datetime',
    ];

    public $timestamps = FALSE; // We use created_at from DB default, no updated_at

    protected static function boot()
    {

        parent::boot();
        static::creating(function ($model)
        {
            if (empty($model->created_at))
            {
                $model->created_at = now();
            }
        });
    }

    public function rencanaAksi()
    {

        return $this->belongsTo(RencanaAksi::class, 'rencana_aksi_id');
    }

    public function attachments()
    {

        return $this->hasMany(ProgressAttachment::class, 'progress_monitoring_id');
    }

}

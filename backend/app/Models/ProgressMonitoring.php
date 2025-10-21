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
        'report_date',
        'progress_percentage',
        'is_late',
        'tanggal_monitoring',
        'catatan',
    ];
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class ProgressAttachment extends Model
{

    use HasFactory;

    protected $fillable = [
        'progress_monitoring_id',
        'file_name',
        'file_path',
        'file_type',
        'file_size',
    ];

    /**
     * Accessor untuk mendapatkan URL file yang bisa diakses publik.
     */
    protected $appends = [ 'url' ];

    public function getUrlAttribute(): ?string
    {

        if (!$this->file_path)
        {
            return NULL;
        }

        return Storage::url($this->file_path);
    }

    public function progressMonitoring()
    {

        return $this->belongsTo(ProgressMonitoring::class);
    }

}

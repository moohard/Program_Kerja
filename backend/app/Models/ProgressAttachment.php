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
    protected $appends = ['url'];

    public function getUrlAttribute(): ?string
        {
        if (!$this->file_path) {
            return NULL;
            }

        if (filter_var($this->file_path, FILTER_VALIDATE_URL)) {
            return $this->file_path;
            }

        // Gunakan URL dari konfigurasi storage
        return Storage::url($this->file_path);
        }
    public function getFileSizeKbAttribute(): ?string
        {
        if (!$this->file_size) {
            return NULL;
            }

        return round($this->file_size / 1024, 2);
        }
    public function progressMonitoring()
        {

        return $this->belongsTo(ProgressMonitoring::class);
        }

    }
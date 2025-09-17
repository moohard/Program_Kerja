<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KategoriUtama extends Model
{

    use HasFactory;

    protected $table = 'kategori_utama';

    protected $fillable = [
        'program_kerja_id',
        'nomor',
        'nama_kategori',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function programKerja()
    {

        return $this->belongsTo(ProgramKerja::class);
    }

    public function kegiatan()
    {

        return $this->hasMany(Kegiatan::class, 'kategori_id');
    }

}

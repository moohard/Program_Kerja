<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProgramKerja extends Model
{

    use HasFactory;

    protected $table = 'program_kerja';

    protected $fillable = [
        'tahun',
        'nama_pengadilan',
        'is_aktif',
    ];

    protected $casts = [
        'is_aktif' => 'boolean',
    ];

    public function kategoriUtama()
    {

        return $this->hasMany(KategoriUtama::class);
    }

}

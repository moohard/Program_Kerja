<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Kegiatan extends Model
{

    use HasFactory;

    protected $table = 'kegiatan';

    protected $fillable = [
        'kategori_id',
        'nama_kegiatan',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function kategoriUtama()
    {

        return $this->belongsTo(KategoriUtama::class, 'kategori_id');
    }

    public function rencanaAksi()
    {

        return $this->hasMany(RencanaAksi::class);
    }

}

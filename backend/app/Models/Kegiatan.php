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

    /**
     * [FIX] - Menambahkan relasi yang hilang.
     * Mendefinisikan bahwa sebuah "Kegiatan" dimiliki oleh satu "KategoriUtama".
     */
    public function kategoriUtama()
    {

        return $this->belongsTo(KategoriUtama::class, 'kategori_id');
    }

    public function rencanaAksi()
    {

        return $this->hasMany(RencanaAksi::class);
    }

    /**
     * Accessor for overall progress percentage.
     *
     * @return \Illuminate\Database\Eloquent\Casts\Attribute
     */
    protected function overallProgressPercentage(): \Illuminate\Database\Eloquent\Casts\Attribute
    {
        return \Illuminate\Database\Eloquent\Casts\Attribute::make(
            get: function () {
                // Eager load relasi jika belum dimuat
                $this->loadMissing('rencanaAksi');
                
                if ($this->rencanaAksi->isEmpty()) {
                    return 0;
                }

                // Gunakan accessor 'overall_progress_percentage' dari RencanaAksi
                return round($this->rencanaAksi->avg('overall_progress_percentage'));
            }
        );
    }
}

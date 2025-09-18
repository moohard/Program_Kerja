<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProgramTemplate extends Model
{

    use HasFactory;

    protected $table = 'program_templates';

    protected $fillable = [
        'nama_template',
        'tahun_referensi',
        'is_default',
    ];

}

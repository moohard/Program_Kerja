<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Jabatan extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'jabatan';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'nama_jabatan',
        'role',
        'parent_id',
        'bidang',
    ];

    /**
     * Get the parent jabatan.
     */
    public function parent()
    {
        return $this->belongsTo(Jabatan::class, 'parent_id');
    }

    /**
     * Get the children jabatan.
     */
    public function children()
    {
        return $this->hasMany(Jabatan::class, 'parent_id');
    }


    /**
     * Get the users for the jabatan.
     */
    public function users()
    {
        return $this->hasMany(User::class);
    }
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TodoItem extends Model
{

    use HasFactory;

    protected $table    = 'todo_items';

    protected $fillable = [ 'rencana_aksi_id', 'deskripsi', 'completed', 'deadline' ];

    protected $casts    = [ 'completed' => 'boolean', 'deadline' => 'datetime' ];

    public function rencanaAksi()
    {

        return $this->belongsTo(RencanaAksi::class);
    }

}

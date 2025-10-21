<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TodoItem extends Model
{

    use HasFactory;

    protected $table    = 'todo_items';

    protected $fillable = [ 'rencana_aksi_id', 'pelaksana_id', 'deskripsi', 'deadline', 'progress_percentage', 'status_approval', 'is_late_upload' ];

    protected $casts    = [ 'deadline' => 'datetime', 'progress_percentage' => 'integer', 'is_late_upload' => 'boolean' ];

    public function rencanaAksi()
    {
        return $this->belongsTo(RencanaAksi::class);
    }

    public function pelaksana()
    {
        return $this->belongsTo(User::class, 'pelaksana_id');
    }

    /**
     * Get all of the attachments for the TodoItem.
     */
    public function attachments()
    {
        return $this->hasMany(TodoItemAttachment::class);
    }
}

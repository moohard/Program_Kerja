<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Facades\Storage;

class TodoItemAttachment extends Model
{
    use HasFactory;

    protected $table = 'todo_item_attachments';

    protected $fillable = [
        'todo_item_id',
        'file_path',
        'file_name',
        'file_type',
        'file_size',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = ['url'];

    public function todoItem()
    {
        return $this->belongsTo(TodoItem::class);
    }

    /**
     * Get the temporary URL for the attachment.
     *
     * @return \Illuminate\Database\Eloquent\Casts\Attribute
     */
    public function url(): Attribute
    {
        return Attribute::make(
            get: fn () => Storage::disk('s3')->temporaryUrl($this->file_path, now()->addMinutes(5))
        );
    }
}
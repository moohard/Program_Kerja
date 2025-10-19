<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TodoItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;

class TodoItemAttachmentController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, TodoItem $todoItem): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'attachment' => 'required|file|mimes:jpg,jpeg,png,pdf,doc,docx,xls,xlsx|max:5120', // Max 5MB per file
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $attachment = DB::transaction(function () use ($request, $todoItem) {
            $file = $request->file('attachment');
            
            // Menggunakan disk 's3' yang sudah dikonfigurasi
            $path = $file->store('todo_attachments', 's3');
            
            $newAttachment = $todoItem->attachments()->create([
                'file_name' => $file->getClientOriginalName(),
                'file_path' => $path,
                'file_type' => $file->getClientMimeType(),
                'file_size' => $file->getSize(),
            ]);

            // Setelah file berhasil diunggah, update status to-do item
            $todoItem->update([
                'status_approval' => 'pending_approval',
                'progress_percentage' => 100,
            ]);

            // Ambil bulan dari request untuk diteruskan
            $month = $request->input('month');

            // Panggil method recalculateProgress dari TodoItemController untuk update progress Rencana Aksi
            (new TodoItemController)->recalculateProgressPublic(
                $todoItem->rencanaAksi,
                "Eviden diunggah untuk to-do: '{$todoItem->deskripsi}', menunggu validasi.",
                $month ? (int)$month : null
            );

            return $newAttachment;
        });

        return response()->json(['message' => 'File uploaded successfully', 'data' => $attachment], 201);
    }
}

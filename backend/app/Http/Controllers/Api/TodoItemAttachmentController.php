<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TodoItem;
use Illuminate\Http\Request;
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
            'attachments' => 'required|array|min:1',
            'attachments.*' => 'required|file|mimes:jpg,jpeg,png,pdf,doc,docx,xls,xlsx|max:5120', // Max 5MB
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $attachments = [];
        foreach ($request->file('attachments') as $file) {
            // Menggunakan disk 's3' yang sudah dikonfigurasi
            $path = $file->store('todo_attachments', 's3');
            $attachment = $todoItem->attachments()->create([
                'file_name' => $file->getClientOriginalName(),
                'file_path' => $path, // Path lengkap dari S3 sudah termasuk prefix
                'file_type' => $file->getClientMimeType(),
                'file_size' => $file->getSize(),
            ]);
            $attachments[] = $attachment;
        }

        // --- LOGIKA BARU ---
        // Jika upload berhasil dan to-do belum selesai, tandai selesai.
        if (!$todoItem->completed) {
            $todoItem->update(['completed' => true]);

            // Panggil method recalculateProgress dari TodoItemController
            // Ini adalah cara untuk menggunakan kembali logika tanpa duplikasi
            (new TodoItemController)->recalculateProgressPublic($todoItem->rencanaAksi, "Eviden diunggah untuk to-do: '{$todoItem->deskripsi}'");
        }
        // --- AKHIR LOGIKA BARU ---

        return response()->json(['message' => 'Files uploaded successfully', 'data' => $attachments], 201);
    }
}

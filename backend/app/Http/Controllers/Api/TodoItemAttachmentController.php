<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TodoItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use App\Notifications\EvidenceUploaded;
use App\Models\User;
use Illuminate\Support\Facades\Log;

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
            // 1. Hapus lampiran lama jika ada
            if ($todoItem->attachments()->exists()) {
                foreach ($todoItem->attachments as $oldAttachment) {
                    Storage::disk('s3')->delete($oldAttachment->file_path);
                    $oldAttachment->delete();
                }
            }

            $file = $request->file('attachment');
            
            // 2. Buat nama file baru yang deskriptif
            $slug = Str::slug($todoItem->deskripsi);
            $extension = $file->getClientOriginalExtension();
            $newFileName = "{$slug}-" . time() . ".{$extension}";
            
            // 3. Simpan file baru dengan nama kustom ke disk 's3'
            $path = $file->storeAs('todo_attachments', $newFileName, 's3');
            
            $newAttachment = $todoItem->attachments()->create([
                'file_name' => $newFileName, // Simpan nama baru
                'file_path' => $path,
                'file_type' => $file->getClientMimeType(),
                'file_size' => $file->getSize(),
            ]);

            // [NEW] Cek keterlambatan upload berdasarkan deadline
            if ($todoItem->deadline && now()->gt($todoItem->deadline)) {
                $todoItem->is_late_upload = true;
            }

            // 4. Update status to-do item
            $todoItem->update([
                'status_approval' => 'pending_approval',
                // Progress di-set 100 saat upload, akan di-reset jika ditolak
                'progress_percentage' => 100, 
            ]);

            $month = $request->input('month');

            // 5. Panggil recalculateProgress untuk update progress Rencana Aksi
            (new TodoItemController)->recalculateProgressPublic(
                $todoItem->rencanaAksi,
                "Eviden direvisi/diunggah untuk to-do: '{$todoItem->deskripsi}', menunggu validasi.",
                $month ? (int)$month : null
            );

            // --- NOTIFICATION LOGIC ---
            try {
                $rencanaAksi = $todoItem->rencanaAksi()->first();
                if ($rencanaAksi && $rencanaAksi->assigned_to) {
                    $pic = User::find($rencanaAksi->assigned_to);
                    if ($pic) {
                        $pic->notify(new EvidenceUploaded($todoItem->load('pelaksana')));
                    }
                }
            } catch (\Exception $e) {
                Log::error('FCM Notification failed for EvidenceUploaded: ' . $e->getMessage());
            }
            // --- END NOTIFICATION LOGIC ---

            return $newAttachment;
        });

        return response()->json(['message' => 'File uploaded successfully', 'data' => $attachment], 201);
    }
}

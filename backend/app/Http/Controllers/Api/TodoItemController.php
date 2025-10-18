<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTodoItemRequest;
use App\Http\Requests\UpdateTodoItemRequest;
use App\Http\Resources\TodoItemResource;
use App\Models\RencanaAksi;
use App\Models\TodoItem;
use App\Models\ProgressMonitoring;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class TodoItemController extends Controller
{
    public function index(RencanaAksi $rencanaAksi)
    {
        // Eager load attachments
        return TodoItemResource::collection($rencanaAksi->todoItems()->with('attachments')->orderBy('created_at')->get());
    }

    public function store(StoreTodoItemRequest $request, RencanaAksi $rencanaAksi)
    {
        $todoItem = $rencanaAksi->todoItems()->create($request->validated());
        return new TodoItemResource($todoItem->load('attachments'));
    }

    public function update(UpdateTodoItemRequest $request, TodoItem $todoItem)
    {
        $todoItem->update($request->validated());
        $this->recalculateProgressPublic($todoItem->rencanaAksi, "Status to-do '{$todoItem->deskripsi}' diubah.");
        return new TodoItemResource($todoItem->load('attachments'));
    }

    public function destroy(TodoItem $todoItem)
    {
        $rencanaAksi = $todoItem->rencanaAksi; // Simpan referensi sebelum dihapus
        $todoItem->delete();
        $this->recalculateProgressPublic($rencanaAksi, "To-do item '{$todoItem->deskripsi}' dihapus.");
        return response()->noContent();
    }

    /**
     * Recalculates and records the progress for a given RencanaAksi.
     * Made public to be accessible from other controllers (e.g., AttachmentController).
     */
    public function recalculateProgressPublic(RencanaAksi $rencanaAksi, string $note)
    {
        DB::transaction(function () use ($rencanaAksi, $note) {
            $totalTodos = $rencanaAksi->todoItems()->count();
            $completedTodos = $rencanaAksi->todoItems()->where('completed', true)->count();

            $progressPercentage = ($totalTodos > 0) ? round(($completedTodos / $totalTodos) * 100) : 0;

            // Panggil JadwalService untuk mendapatkan tanggal laporan yang benar
            $jadwalService = app(\App\Services\JadwalService::class);
            $reportDate = $jadwalService->getApplicableReportDate($rencanaAksi);
            $isLate = now()->gt($reportDate);

            // Gunakan updateOrCreate untuk mencatat progress pada periode yang benar
            ProgressMonitoring::updateOrCreate(
                [
                    'rencana_aksi_id' => $rencanaAksi->id,
                    'report_date' => $reportDate,
                ],
                [
                    'progress_percentage' => $progressPercentage,
                    'catatan' => DB::raw("CONCAT(IFNULL(catatan, ''), '\n', " . DB::connection()->getPdo()->quote($note) . ")"),
                    'tanggal_monitoring' => now(),
                    'is_late' => $isLate,
                ]
            );

            // Update status Rencana Aksi
            $status = match (true) {
                ($progressPercentage >= 100) => 'completed', // Gunakan >= 100 untuk keamanan
                ($progressPercentage > 0) => 'in_progress',
                default => 'planned',
            };

            $rencanaAksi->update([
                'status' => $status,
                'actual_tanggal' => ($progressPercentage >= 100) ? ($rencanaAksi->actual_tanggal ?? now()) : null
            ]);
        });
    }
}
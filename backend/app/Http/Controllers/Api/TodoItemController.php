<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTodoItemRequest;
use App\Http\Requests\UpdateTodoItemRequest;
use App\Http\Resources\TodoItemResource;
use App\Models\RencanaAksi;
use App\Models\TodoItem;
use Illuminate\Http\Request;
use App\Models\ProgressMonitoring;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class TodoItemController extends Controller
{
    public function index(Request $request, RencanaAksi $rencanaAksi)
    {
        $month = $request->input('month');

        $query = $rencanaAksi->todoItems()->with('attachments')->orderBy('created_at');

        if ($month) {
            $query->whereMonth('deadline', $month);
        }

        return TodoItemResource::collection($query->get());
    }

    public function store(StoreTodoItemRequest $request, RencanaAksi $rencanaAksi)
    {
        $validated = $request->validated();
        $month = $request->input('month');

        // Jika bulan diberikan tapi deadline tidak, set deadline ke akhir bulan tersebut.
        if ($month && empty($validated['deadline'])) {
            $validated['deadline'] = \Carbon\Carbon::create(date('Y'), $month)->endOfMonth();
        }

        $todoItem = $rencanaAksi->todoItems()->create($validated);
        $this->recalculateProgressPublic($rencanaAksi, "To-do item '{$todoItem->deskripsi}' ditambahkan.", $month);
        return new TodoItemResource($todoItem->load('attachments'));
    }

    public function update(UpdateTodoItemRequest $request, TodoItem $todoItem)
    {
        $todoItem->update($request->validated());
        $this->recalculateProgressPublic($todoItem->rencanaAksi, "Status to-do '{$todoItem->deskripsi}' diubah.", $request->input('month'));
        return new TodoItemResource($todoItem->load('attachments'));
    }

    public function destroy(Request $request, TodoItem $todoItem)
    {
        $rencanaAksi = $todoItem->rencanaAksi; // Simpan referensi sebelum dihapus
        $todoItem->delete();
        $this->recalculateProgressPublic($rencanaAksi, "To-do item '{$todoItem->deskripsi}' dihapus.", $request->input('month'));
        return response()->noContent();
    }

    /**
     * Recalculates and records the progress for a given RencanaAksi.
     * Made public to be accessible from other controllers (e.g., AttachmentController).
     */
    public function recalculateProgressPublic(RencanaAksi $rencanaAksi, string $note, ?int $month = null)
    {
        DB::transaction(function () use ($rencanaAksi, $note, $month) {
            
            // Tentukan query dasar untuk to-do item
            $todoQuery = $rencanaAksi->todoItems();

            // Jika ada konteks bulan, filter to-do berdasarkan bulan deadline
            if ($month) {
                $todoQuery->whereMonth('deadline', $month);
            }

            // Penting: Klon query sebelum menambahkan kondisi lebih lanjut
            $totalTodos = $todoQuery->count();
            $completedTodos = $todoQuery->clone()->where('completed', true)->count();

            $progressPercentage = ($totalTodos > 0) ? round(($completedTodos / $totalTodos) * 100) : 0;

            // Panggil JadwalService untuk mendapatkan tanggal laporan yang benar
            $jadwalService = app(\App\Services\JadwalService::class);
            $reportDate = $jadwalService->getApplicableReportDate($rencanaAksi, null, $month);
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

            // Update status Rencana Aksi based on all required reports being complete
            $targetMonths = $jadwalService->getTargetMonths($rencanaAksi->jadwal_tipe, $rencanaAksi->jadwal_config);
            
            if (empty($targetMonths)) {
                // For 'rutin' or non-periodic tasks, original logic applies
                $status = ($progressPercentage >= 100) ? 'completed' : (($progressPercentage > 0) ? 'in_progress' : 'planned');
            } else {
                // For periodic tasks, check if all target months are 100% complete
                $completedMonths = ProgressMonitoring::where('rencana_aksi_id', $rencanaAksi->id)
                    ->where('progress_percentage', 100)
                    ->pluck('report_date')
                    ->map(fn($date) => Carbon::parse($date)->month)
                    ->unique()
                    ->toArray();

                $isFullyComplete = empty(array_diff($targetMonths, $completedMonths));

                if ($isFullyComplete) {
                    $status = 'completed';
                } elseif ($rencanaAksi->progressMonitorings()->where('progress_percentage', '>', 0)->exists()) {
                    // If any progress exists at all, it's in_progress
                    $status = 'in_progress';
                } else {
                    $status = 'planned';
                }
            }

            $rencanaAksi->update([
                'status' => $status,
                'actual_tanggal' => ($status === 'completed') ? ($rencanaAksi->actual_tanggal ?? now()) : null
            ]);
        });
    }
}
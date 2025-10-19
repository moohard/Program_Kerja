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

        $query = $rencanaAksi->todoItems()->with(['attachments', 'pelaksana', 'rencanaAksi.assignedTo'])->orderBy('created_at');

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
        return new TodoItemResource($todoItem->load(['attachments', 'pelaksana']));
    }

    public function update(UpdateTodoItemRequest $request, TodoItem $todoItem)
    {
        $validated = $request->validated();
        $note = "Status to-do '{$todoItem->deskripsi}' diubah.";

        // Logika khusus untuk approval oleh PIC
        if (isset($validated['status_approval'])) {
            // Otorisasi: Hanya PIC dari Rencana Aksi yang bisa approve/reject
            $rencanaAksi = $todoItem->rencanaAksi;
            if (Auth::id() !== $rencanaAksi->assigned_to) {
                return response()->json(['message' => 'Hanya penanggung jawab yang bisa mengubah status approval.'], 403);
            }

            if ($validated['status_approval'] === 'approved') {
                $validated['progress_percentage'] = 100;
                $note = "To-do '{$todoItem->deskripsi}' disetujui oleh PIC.";
            } elseif ($validated['status_approval'] === 'pending_upload') { // Ini berarti ditolak/revisi
                $validated['progress_percentage'] = 0;
                $note = "To-do '{$todoItem->deskripsi}' ditolak oleh PIC, butuh perbaikan.";
            }
        }
        
        $todoItem->update($validated);

        $this->recalculateProgressPublic($todoItem->rencanaAksi, $note, $request->input('month'));
        
        return new TodoItemResource($todoItem->load(['attachments', 'pelaksana']));
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
            // Start a fresh query builder from the relationship
            $todoQuery = $rencanaAksi->todoItems();

            // Conditionally apply the month filter
            if ($month) {
                $todoQuery->whereMonth('deadline', $month);
            }

            // Now, execute the query to get the relevant todos
            $todos = $todoQuery->get(['progress_percentage', 'bobot']);

            $totalBobot = $todos->sum('bobot');
            $weightedProgressSum = $todos->sum(function ($todo) {
                return ($todo->progress_percentage / 100) * $todo->bobot;
            });

            $progressPercentage = ($totalBobot > 0) ? round(($weightedProgressSum / $totalBobot) * 100) : 0;

            $jadwalService = app(\App\Services\JadwalService::class);
            $reportDate = $jadwalService->getApplicableReportDate($rencanaAksi, null, $month);
            $isLate = now()->gt($reportDate);

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

            $targetMonths = $jadwalService->getTargetMonths($rencanaAksi->jadwal_tipe, $rencanaAksi->jadwal_config);
            
            if (empty($targetMonths)) {
                $status = ($progressPercentage >= 100) ? 'completed' : (($progressPercentage > 0) ? 'in_progress' : 'planned');
            } else {
                $completedMonths = ProgressMonitoring::where('rencana_aksi_id', $rencanaAksi->id)
                    ->where('progress_percentage', 100)
                    ->pluck('report_date')
                    ->map(fn($date) => \Carbon\Carbon::parse($date)->month)
                    ->unique()
                    ->toArray();

                $isFullyComplete = empty(array_diff($targetMonths, $completedMonths));

                if ($isFullyComplete) {
                    $status = 'completed';
                } elseif ($rencanaAksi->progressMonitorings()->where('progress_percentage', '>', 0)->exists()) {
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
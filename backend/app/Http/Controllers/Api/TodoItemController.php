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
use App\Models\User;
use App\Notifications\TodoItemAssigned;
use App\Notifications\TodoItemStatusUpdated;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

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
        // Validasi kustom untuk memastikan bulan dipilih
        if (!$request->has('month') || is_null($request->input('month'))) {
            return response()->json(['message' => 'Gagal menambahkan todo, silakan pilih bulan terlebih dahulu'], 422);
        }

        $validated = $request->validated();
        $month = $request->input('month');

                $todoItem = DB::transaction(function () use ($rencanaAksi, &$validated, $month) {

                    // [FIX] Jika deadline tidak disediakan, atur ke akhir bulan agar tidak hilang dari filter.

                    if ($month && empty($validated['deadline'])) {

                        $year = $rencanaAksi->target_tanggal ? \Carbon\Carbon::parse($rencanaAksi->target_tanggal)->year : date('Y');

                        $validated['deadline'] = \Carbon\Carbon::create($year, $month)->endOfMonth();

                    }

        

                    $todoItem = $rencanaAksi->todoItems()->create($validated);

        

                    $this->recalculateProgressPublic($rencanaAksi, "To-do item '{$todoItem->deskripsi}' ditambahkan.", $month);
            
            return $todoItem;
        });

        // Notify the assigned user
        try {
            if (!empty($validated['pelaksana_id'])) {
                $userToNotify = User::find($validated['pelaksana_id']);
                if ($userToNotify) {
                    $userToNotify->notify(new TodoItemAssigned($todoItem));
                }
            }
        } catch (\Exception $e) {
            Log::error('FCM Notification failed for TodoItemAssigned (store): ' . $e->getMessage());
        }

        return new TodoItemResource($todoItem->load(['attachments', 'pelaksana']));
    }

    public function update(UpdateTodoItemRequest $request, TodoItem $todoItem)
    {
        $validated = $request->validated();
        $note = "Status to-do '{$todoItem->deskripsi}' diubah.";
        $originalPelaksanaId = $todoItem->pelaksana_id;
        $originalStatus = $todoItem->status_approval;

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
            } elseif (in_array($validated['status_approval'], ['pending_upload', 'rejected'])) { // Handle ditolak/revisi
                $validated['progress_percentage'] = 0;
                $note = "To-do '{$todoItem->deskripsi}' ditolak oleh PIC, butuh perbaikan.";
            }
        }
        
        $todoItem->update($validated);

        // --- NOTIFICATION LOGIC ---
        try {
            // 1. Notify new assignee if pelaksana_id changed
            $newPelaksanaId = $todoItem->pelaksana_id;
            if ($newPelaksanaId && $newPelaksanaId !== $originalPelaksanaId) {
                $userToNotify = User::find($newPelaksanaId);
                if ($userToNotify) {
                    $userToNotify->notify(new TodoItemAssigned($todoItem));
                }
            }

            // 2. Notify pelaksana if status_approval changed
            if (isset($validated['status_approval']) && $validated['status_approval'] !== $originalStatus) {
                if ($todoItem->pelaksana) { // Make sure pelaksana exists
                    $todoItem->pelaksana->notify(new TodoItemStatusUpdated($todoItem));
                }
            }
        } catch (\Exception $e) {
            Log::error('FCM Notification failed for TodoItem (update): ' . $e->getMessage());
        }
        // --- END NOTIFICATION LOGIC ---

        // [FIX] Gunakan bulan dari deadline item sebagai fallback jika tidak ada di request
        $monthToRecalculate = $request->input('month') ?? ($todoItem->deadline ? $todoItem->deadline->month : null);

        $this->recalculateProgressPublic($todoItem->rencanaAksi, $note, $monthToRecalculate);
        
        return new TodoItemResource($todoItem->load(['attachments', 'pelaksana']));
    }

    public function destroy(Request $request, TodoItem $todoItem)
    {
        $rencanaAksi = $todoItem->rencanaAksi;
        // Get the month directly from the item's deadline for accuracy.
        $monthToRecalculate = $todoItem->deadline ? \Carbon\Carbon::parse($todoItem->deadline)->month : null;

        $todoItem->delete();

        $this->recalculateProgressPublic($rencanaAksi, "To-do item '{$todoItem->deskripsi}' dihapus.", $monthToRecalculate);
        
        return response()->noContent();
    }

    /**
     * Recalculates and records the progress for a given RencanaAksi.
     * Made public to be accessible from other controllers (e.g., AttachmentController).
     */
    public function recalculateProgressPublic(RencanaAksi $rencanaAksi, string $note, ?int $month = null)
    {
        // [REVISED] If no month is provided, we only trigger the overall status update and do not proceed.
        // This prevents creating incorrect monthly progress records.
        if (is_null($month)) {
            Log::info("recalculateProgressPublic dipanggil tanpa bulan untuk RencanaAksi ID: {$rencanaAksi->id}. Hanya memperbarui status keseluruhan.");
            $this->updateRencanaAksiOverallStatus($rencanaAksi);
            return;
        }

        DB::transaction(function () use ($rencanaAksi, $note, $month) {
            Log::info("=== MONTHLY PROGRESS RECALCULATION START ===");
            Log::info("RencanaAksi ID: {$rencanaAksi->id}, Month: {$month}");

            $jadwalService = app(\App\Services\JadwalService::class);

            // 1. Tentukan query to-do berdasarkan bulan yang relevan
            $todoQuery = $rencanaAksi->todoItems()->whereMonth('deadline', $month);
            
            $todos = $todoQuery->get(['id', 'deskripsi', 'progress_percentage', 'status_approval']);
            Log::info("Found " . $todos->count() . " To-Do items for this period.", $todos->toArray());

            // 2. Hitung progress untuk bulan tersebut berdasarkan jumlah to-do yang disetujui
            $totalTodos = $todos->count();
            $completedTodos = $todos->where('status_approval', 'approved')->count();

            Log::info("Total Todos: {$totalTodos}, Completed Todos (Approved): {$completedTodos}");

            $progressPercentage = ($totalTodos > 0) ? round(($completedTodos / $totalTodos) * 100) : 0;
            Log::info("Calculated Monthly Percentage: {$progressPercentage}%");

            // 3. Dapatkan tanggal laporan yang benar untuk bulan ini
            $reportDate = $jadwalService->getApplicableReportDate($rencanaAksi, null, $month);
            Log::info("Applicable Report Date: " . $reportDate->format('Y-m-d'));

            // 4. Hapus progres lama dan buat yang baru untuk memastikan atomisitas
            ProgressMonitoring::updateOrCreate(
                [
                    'rencana_aksi_id' => $rencanaAksi->id,
                    'report_date' => $reportDate,
                ],
                [
                    'progress_percentage' => $progressPercentage,
                    'is_late' => now()->gt($reportDate),
                    'tanggal_monitoring' => now(),
                    'keterangan' => DB::raw("CONCAT(IFNULL(keterangan, ''), '\n', " . DB::connection()->getPdo()->quote($note) . ")")
                ]
            );

            Log::info("Saved new ProgressMonitoring record for {$reportDate->format('Y-m-d')} with percentage {$progressPercentage}%.");

            // 5. Hitung ulang status dan progres keseluruhan Rencana Aksi
            $this->updateRencanaAksiOverallStatus($rencanaAksi);
            Log::info("=== MONTHLY PROGRESS RECALCULATION END ===");
        });
    }

    private function updateRencanaAksiOverallStatus(RencanaAksi $rencanaAksi)
    {
        $jadwalService = app(\App\Services\JadwalService::class);
        
        $targetMonths = $jadwalService->getTargetMonths($rencanaAksi->jadwal_tipe, $rencanaAksi->jadwal_config ?? []);
        
        if (empty($targetMonths)) {
            $allTodos = $rencanaAksi->todoItems()->count();
            $completedTodos = $rencanaAksi->todoItems()->where('status_approval', 'approved')->count();
            $overallProgress = ($allTodos > 0) ? round(($completedTodos / $allTodos) * 100) : 0;
        } else {
            $progressRecords = ProgressMonitoring::where('rencana_aksi_id', $rencanaAksi->id)
                ->whereIn(DB::raw('MONTH(report_date)'), $targetMonths)
                ->get()
                ->keyBy(fn($item) => \Carbon\Carbon::parse($item->report_date)->month);

            $totalProgress = 0;
            foreach ($targetMonths as $month) {
                $totalProgress += $progressRecords[$month]->progress_percentage ?? 0;
            }
            
            $divisor = count($targetMonths);
            $overallProgress = ($divisor > 0) ? round($totalProgress / $divisor) : 0;
        }

        // [FIX] Redefine status logic locally
        $status = 'planned';
        if ($overallProgress >= 100) {
            $status = 'completed';
        } elseif ($overallProgress > 0) {
            $status = 'in_progress';
        }

        $rencanaAksi->update([
            'status' => $status,
            'progress_keseluruhan' => $overallProgress,
            'actual_tanggal' => ($status === 'completed') ? ($rencanaAksi->actual_tanggal ?? now()) : null
        ]);
    }
}
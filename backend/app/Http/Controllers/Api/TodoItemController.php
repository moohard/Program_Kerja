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
        // Validasi kustom untuk memastikan bulan dipilih
        if (!$request->has('month') || is_null($request->input('month'))) {
            return response()->json(['message' => 'Gagal menambahkan todo, silakan pilih bulan terlebih dahulu'], 422);
        }

        $validated = $request->validated();
        $month = $request->input('month');

        $todoItem = DB::transaction(function () use ($rencanaAksi, $validated, $month) {
            // Validasi total bobot tidak melebihi 100%
            $totalBobotSaatIni = $rencanaAksi->todoItems()->whereMonth('deadline', $month)->sum('bobot');
            if (($totalBobotSaatIni + $validated['bobot']) > 100) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'bobot' => 'Total bobot untuk semua to-do di bulan ini tidak boleh melebihi 100%. Sisa bobot: ' . (100 - $totalBobotSaatIni) . '%',
                ]);
            }

            // Jika bulan diberikan tapi deadline tidak, set deadline ke akhir bulan tersebut.
            if ($month && empty($validated['deadline'])) {
                $validated['deadline'] = \Carbon\Carbon::create(date('Y'), $month)->endOfMonth();
            }

            $todoItem = $rencanaAksi->todoItems()->create($validated);

            $this->recalculateProgressPublic($rencanaAksi, "To-do item '{$todoItem->deskripsi}' ditambahkan.", $month);
            
            return $todoItem;
        });

        return new TodoItemResource($todoItem->load(['attachments', 'pelaksana']));
    }

    public function update(UpdateTodoItemRequest $request, TodoItem $todoItem)
    {
        $validated = $request->validated();
        $note = "Status to-do '{$todoItem->deskripsi}' diubah.";

        // Validasi bobot saat update
        if (isset($validated['bobot'])) {
            $month = $request->input('month');
            if ($month) {
                $totalBobotLain = $todoItem->rencanaAksi->todoItems()
                    ->where('id', '!=', $todoItem->id)
                    ->whereMonth('deadline', $month)
                    ->sum('bobot');

                if (($totalBobotLain + $validated['bobot']) > 100) {
                    throw \Illuminate\Validation\ValidationException::withMessages([
                        'bobot' => 'Total bobot untuk semua to-do di bulan ini tidak boleh melebihi 100%. Sisa bobot yang bisa dialokasikan: ' . (100 - $totalBobotLain) . '%',
                    ]);
                }
            }
        }

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
        // [CRITICAL FIX] For periodic tasks, never recalculate without a specific month context.
        // This prevents creating erroneous "Overall" progress records in the wrong month slot (e.g., December).
        if ($rencanaAksi->jadwal_tipe === 'periodik' && is_null($month)) {
            return;
        }

        DB::transaction(function () use ($rencanaAksi, $note, $month) {
            $jadwalService = app(\App\Services\JadwalService::class);

            // 1. Tentukan query to-do berdasarkan bulan yang relevan
            $todoQuery = $rencanaAksi->todoItems();
            if ($month) {
                $todoQuery->whereMonth('deadline', $month);
            }
            $todos = $todoQuery->get(['progress_percentage', 'bobot']);

            // 2. Hitung progress untuk bulan tersebut berdasarkan logika baru (jumlah bobot dari to-do yang selesai)
            $progressPercentage = $todos->where('progress_percentage', 100)->sum('bobot');

            // 3. Dapatkan tanggal laporan yang benar untuk bulan ini
            $reportDate = $jadwalService->getApplicableReportDate($rencanaAksi, null, $month);

            // 4. Siapkan data untuk disimpan
            $progressData = [
                'progress_percentage' => $progressPercentage,
                'is_late' => now()->gt($reportDate),
                'tanggal_monitoring' => now(),
                'catatan' => DB::raw("CONCAT(IFNULL(catatan, ''), '\n', " . DB::connection()->getPdo()->quote($note) . ")")
            ];

            // 5. Delete old progress for this date and create the new one to ensure atomicity.
            ProgressMonitoring::where('rencana_aksi_id', $rencanaAksi->id)
                ->where('report_date', $reportDate)
                ->delete();
            
            ProgressMonitoring::create([
                'rencana_aksi_id' => $rencanaAksi->id,
                'report_date' => $reportDate,
                'progress_percentage' => $progressPercentage,
                'is_late' => now()->gt($reportDate),
                'tanggal_monitoring' => now(),
            ]);

            // 6. Hitung ulang status keseluruhan Rencana Aksi
            $this->updateRencanaAksiOverallStatus($rencanaAksi);
        });
    }

    /**
     * [NEW] Helper function to calculate and update the overall status of a RencanaAksi.
     */
    private function updateRencanaAksiOverallStatus(RencanaAksi $rencanaAksi)
    {
        $jadwalService = app(\App\Services\JadwalService::class);
        $allProgress = ProgressMonitoring::where('rencana_aksi_id', $rencanaAksi->id)->get();

        if ($allProgress->isEmpty()) {
            $status = 'planned';
        } else {
            $targetMonths = $jadwalService->getTargetMonths($rencanaAksi->jadwal_tipe, $rencanaAksi->jadwal_config);
            
            if (empty($targetMonths)) {
                $isFullyComplete = $allProgress->sortByDesc('report_date')->first()->progress_percentage >= 100;
            } else {
                $completedMonths = $allProgress->where('progress_percentage', 100)
                    ->pluck('report_date')
                    ->map(fn($date) => \Carbon\Carbon::parse($date)->month)
                    ->unique()
                    ->sort()
                    ->values()
                    ->all();
                
                $sortedTargetMonths = collect($targetMonths)->sort()->values()->all();
                $isFullyComplete = $sortedTargetMonths === $completedMonths;
            }

            if ($isFullyComplete) {
                $status = 'completed';
            } elseif ($allProgress->where('progress_percentage', '>', 0)->isNotEmpty()) {
                $status = 'in_progress';
            } else {
                $status = 'planned';
            }
        }

        $rencanaAksi->update([
            'status' => $status,
            'actual_tanggal' => ($status === 'completed') ? ($rencanaAksi->actual_tanggal ?? now()) : null
        ]);

        $rencanaAksi->unsetRelation('progressMonitorings');
    }
}
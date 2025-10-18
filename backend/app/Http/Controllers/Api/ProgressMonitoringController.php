<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProgressMonitoringRequest;
use App\Http\Resources\ProgressMonitoringResource;
use App\Http\Resources\RencanaAksiResource; // <-- Tambahkan ini
use App\Models\ProgressMonitoring;
use App\Models\RencanaAksi;
use App\Models\AuditLog;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class ProgressMonitoringController extends Controller
{
    public function indexByRencanaAksi(RencanaAksi $rencanaAksi)
    {
        $progressHistory = $rencanaAksi->progressMonitorings()
            ->orderBy('report_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return ProgressMonitoringResource::collection($progressHistory);
    }

    public function store(StoreProgressMonitoringRequest $request, RencanaAksi $rencanaAksi)
    {

        $validated = $request->validated();
        // [UPDATE] - Membuat tanggal laporan dari input tahun dan bulan
        // Kita set tanggalnya menjadi akhir bulan
        $reportDate = Carbon::create($validated['report_year'], $validated['report_month'])->endOfMonth();
        DB::beginTransaction();
        try
        {
            // 1. Create progress monitoring
            $progress = ProgressMonitoring::updateOrCreate(
                [
                    'rencana_aksi_id' => $rencanaAksi->id,
                    'report_date'     => $reportDate,
                ],
                [
                    'progress_percentage' => $validated['progress_percentage'],
                    'catatan'             => $validated['catatan'],
                    'tanggal_monitoring'  => now(), // Tanggal aktual kapan input dibuat
                ],
            );

            // 2. Update rencana aksi status
            $highestProgress = $rencanaAksi->progressMonitorings()->max('progress_percentage');
            $status          = match (TRUE)
            {
                $highestProgress == 100 => 'completed',
                $highestProgress > 0    => 'in_progress',
                default                 => 'planned'
            };

            $rencanaAksi->update([
                'status'         => $status,
                'actual_tanggal' => $highestProgress == 100 ? ($rencanaAksi->actual_tanggal ?? now()) : NULL
            ]);

            // 3. Audit log
            AuditLog::create([
                'user_id'    => Auth::id(),
                'action'     => 'UPDATE',
                'table_name' => 'rencana_aksi',
                'record_id'  => $rencanaAksi->id,
                'new_values' => json_encode([
                    'progress' => $request->progress_percentage,
                    'status'   => $status,
                ]),
            ]);

            DB::commit();

            // Refresh relationships
            $rencanaAksi->refresh()->load([ 'assignedTo', 'latestProgress', 'progressMonitorings' ]);

            return new RencanaAksiResource($rencanaAksi);

        } catch (\Exception $e)
        {
            DB::rollBack();
            \Log::error('Failed to store progress: ' . $e->getMessage());
            return response()->json([ 'message' => 'Gagal menyimpan progress.' ], 500);
        }
    }

}

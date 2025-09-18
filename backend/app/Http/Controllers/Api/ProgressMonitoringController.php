<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProgressMonitoringRequest;
use App\Http\Resources\ProgressMonitoringResource;
use App\Models\RencanaAksi;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class ProgressMonitoringController extends Controller
    {
    public function index(RencanaAksi $rencanaAksi)
        {
        // Eager load relasi attachments
        $progressHistory = $rencanaAksi->progressMonitorings()
            ->with('attachments')
            ->orderBy('tanggal_monitoring', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();
        return ProgressMonitoringResource::collection($progressHistory);
        }

    public function store(StoreProgressMonitoringRequest $request, RencanaAksi $rencanaAksi)
        {
        DB::beginTransaction();
 
        try {
 
            // 1. Panggil Stored Procedure untuk update progress dan status
            DB::statement(
                'CALL sp_update_progress(?, ?, ?, ?)',
                [
                    $rencanaAksi->id,
                    $request->progress_percentage,
                    $request->keterangan,
                    Auth::id(),
                ],
            );
            // 2. Ambil record progress yang baru saja dibuat oleh procedure
            $latestProgress = $rencanaAksi->progressMonitorings()->latest('created_at')->first();
            // 3. Jika ada file lampiran, proses dan simpan
            if ($request->hasFile('attachments')) {
                foreach ($request->file('attachments') as $file) {
                    // Simpan file ke storage/app/public/attachments
                    $path = $file->store('public/attachments');

                    // Buat record di database
                    $latestProgress->attachments()->create([
                        'file_name' => $file->getClientOriginalName(),
                        'file_path' => $path,
                        'file_type' => $file->getClientMimeType(),
                        'file_size' => $file->getSize(),
                    ]);
                    }
                }

            DB::commit();

            // Load relasi attachment sebelum mengembalikan response
            $latestProgress->load('attachments');

            return new ProgressMonitoringResource($latestProgress);

            }
        catch (\Exception $e) {
            DB::rollBack();
            // Optional: Log the error
            // Log::error('Failed to store progress: ' . $e->getMessage());
            return response()->json(['message' => 'Gagal menyimpan progress.'], 500);
            }
        }
    }
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RencanaAksi;
use App\Http\Requests\StoreRencanaAksiRequest;
use App\Http\Requests\UpdateRencanaAksiRequest;
use App\Http\Resources\RencanaAksiResource;
use Illuminate\Http\Request;
use App\Models\User;
use App\Notifications\RencanaAksiAssigned;
use App\Services\JadwalService;
use Illuminate\Support\Facades\Log;

class RencanaAksiController extends Controller
{
    protected $jadwalService;

    public function __construct(JadwalService $jadwalService)
    {
        $this->jadwalService = $jadwalService;
    }

        public function index(Request $request)
        {
            $request->validate([
                'kegiatan_id' => 'required|exists:kegiatan,id',
                'month'       => 'nullable|integer|min:1|max:12',
            ]);
    
            $kegiatanId = $request->kegiatan_id;
            $month = $request->month;
            $user = $request->user()->load('jabatan');
            $userJabatan = $user->jabatan->nama_jabatan ?? null;
    
            // 1. Base query to get all relevant Rencana Aksi
            $rencanaAksiQuery = RencanaAksi::where('kegiatan_id', $kegiatanId)
                ->with('assignedTo:id,name', 'progressMonitorings', 'todoItems') // Removed 'latestProgress'
                ->where('jadwal_tipe', '!=', 'rutin');
    
            // 2. Apply authorization filter for non-privileged users
            if (!in_array($userJabatan, ['Administrator', 'Ketua'])) {
                $rencanaAksiQuery->where(function ($query) use ($user) {
                    $query->where('assigned_to', $user->id)
                          ->orWhereHas('todoItems', function ($todoQuery) use ($user) {
                              $todoQuery->where('pelaksana_id', $user->id);
                          });
                });
            }
    
            // 3. Fetch the collection from the database
            $rencanaAksi = $rencanaAksiQuery->latest()->get();

            // [CRITICAL FIX] Force-reload the relationship to prevent stale data issues.
            $rencanaAksi->load('progressMonitorings');
    
            // 4. Attach progress object consistently for ALL roles
            if ($month) {
                // --- Logic for when a specific month is filtered ---
                $jadwalService = $this->jadwalService;
    
                $rencanaAksi = $rencanaAksi->filter(function ($ra) use ($month, $jadwalService) {
                    $targetMonths = $jadwalService->getTargetMonths($ra->jadwal_tipe, $ra->jadwal_config);
                    return in_array($month, $targetMonths);
                });
    
                $rencanaAksi->map(function ($ra) use ($month, $jadwalService) {
                    $applicableReportDate = $jadwalService->getApplicableReportDate($ra, null, $month);
                    
                    // [DEFINITIVE FIX] Query the database directly and order by the latest monitoring date to get the true latest progress for the month.
                    $progressForMonth = \App\Models\ProgressMonitoring::where('rencana_aksi_id', $ra->id)
                        ->where('report_date', $applicableReportDate->format('Y-m-d'))
                        ->latest('tanggal_monitoring')
                        ->first();

                    if (!$progressForMonth) {
                        $ra->monthly_progress = (object) [
                            'progress_percentage' => 0, 'is_late' => false, 'catatan' => 'Belum ada laporan untuk bulan ini.', 'report_date' => $applicableReportDate->format('Y-m-d'),
                        ];
                    } else {
                        $ra->monthly_progress = $progressForMonth;
                    }
                    return $ra;
                });
            } else {
                // For the "All Months" view, we don't need to attach any specific monthly progress.
                // The frontend will automatically use the 'overall_progress_percentage' accessor,
                // which is calculated correctly in the RencanaAksiResource.
            }
    
            return RencanaAksiResource::collection($rencanaAksi);
        }

    public function store(StoreRencanaAksiRequest $request)
    {
        $user = $request->user()->load('jabatan');
        $userJabatan = $user->jabatan->nama_jabatan ?? null;

        if (!in_array($userJabatan, ['Administrator', 'Ketua'])) {
            abort(403, 'Anda tidak memiliki izin untuk membuat Rencana Aksi baru.');
        }

        $validated = $request->validated();

        // Validasi jadwal_config menggunakan JadwalService
        if (isset($validated['jadwal_tipe']) && isset($validated['jadwal_config'])) {
            $this->jadwalService->validateConfig($validated['jadwal_config'], $validated['jadwal_tipe']);
        }

        $rencanaAksi = RencanaAksi::create($validated);

        try {
            $assignedUserId = $validated['assigned_to'] ?? null;
            if ($assignedUserId) {
                $userToNotify = User::find($assignedUserId);
                if ($userToNotify) {
                    $userToNotify->notify(new RencanaAksiAssigned($rencanaAksi));
                }
            }
        } catch (\Exception $e) {
            \Log::error('FCM Notification failed during store: ' . $e->getMessage());
        }

        return new RencanaAksiResource($rencanaAksi->load(['assignedTo', 'progressMonitorings', 'latestProgress']));
    }

    public function show(RencanaAksi $rencanaAksi)
    {
        return new RencanaAksiResource($rencanaAksi->load(['assignedTo', 'progressMonitorings', 'latestProgress']));
    }

    public function update(UpdateRencanaAksiRequest $request, RencanaAksi $rencanaAksi)
    {
        $user = $request->user()->load('jabatan');
        $userJabatan = $user->jabatan->nama_jabatan ?? null;

        // Allow admins/chairs to edit anything.
        // Allow regular users (PICs) to edit only their own assigned Rencana Aksi.
        if (!in_array($userJabatan, ['Administrator', 'Ketua']) && $rencanaAksi->assigned_to !== $user->id) {
            abort(403, 'Anda tidak memiliki izin untuk mengubah Rencana Aksi ini.');
        }

        $validated = $request->validated();

        // Validasi jadwal_config menggunakan JadwalService
        if (isset($validated['jadwal_tipe']) && isset($validated['jadwal_config'])) {
            $this->jadwalService->validateConfig($validated['jadwal_config'], $validated['jadwal_tipe']);
        }

        $rencanaAksi->update($validated);

        try {
            $assignedUserId = $validated['assigned_to'] ?? null;
            if ($assignedUserId) {
                $userToNotify = User::find($assignedUserId);
                if ($userToNotify) {
                    $userToNotify->notify(new RencanaAksiAssigned($rencanaAksi));
                }
            }
        } catch (\Exception $e) {
            \Log::error('FCM Notification failed during update: ' . $e->getMessage());
        }

        return new RencanaAksiResource(RencanaAksi::with(['assignedTo', 'progressMonitorings', 'latestProgress'])->findOrFail($rencanaAksi->id));
    }

    public function destroy(RencanaAksi $rencanaAksi)
    {
        $user = request()->user()->load('jabatan'); // Get user from request helper
        $userJabatan = $user->jabatan->nama_jabatan ?? null;

        if (!in_array($userJabatan, ['Administrator', 'Ketua'])) {
            abort(403, 'Anda tidak memiliki izin untuk menghapus Rencana Aksi.');
        }

        $rencanaAksi->delete();
        return response()->noContent();
    }



    }
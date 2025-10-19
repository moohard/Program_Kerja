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

        $rencanaAksiQuery = RencanaAksi::where('kegiatan_id', $kegiatanId)
            ->with(['assignedTo:id,name', 'latestProgress']);

        // Eager load progress specific to the requested month if provided
        if ($month) {
            $rencanaAksiQuery->with(['progressMonitorings' => function ($query) use ($month) {
                $query->whereMonth('report_date', $month);
            }]);
        } else {
            $rencanaAksiQuery->with('progressMonitorings');
        }

        $rencanaAksi = $rencanaAksiQuery->latest()->get();
        $jadwalService = app(JadwalService::class);

        // If a month is specified, filter the results and calculate monthly status
        if ($month) {
            $rencanaAksi = $rencanaAksi->filter(function ($item) use ($month, $jadwalService) {
                $targetMonths = $jadwalService->getTargetMonths($item->jadwal_tipe, $item->jadwal_config);
                return in_array($month, $targetMonths);
            });

            $rencanaAksi->each(function ($item) use ($month, $jadwalService) {
                $targetMonths = $jadwalService->getTargetMonths($item->jadwal_tipe, $item->jadwal_config);
                $item->monthly_status = $this->calculateMonthlyStatus($item, $month, $targetMonths);
            });
        }

        return RencanaAksiResource::collection($rencanaAksi);
    }

    public function store(StoreRencanaAksiRequest $request)
    {
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

        return new RencanaAksiResource($rencanaAksi->refresh()->load(['assignedTo', 'progressMonitorings', 'latestProgress']));
    }

    public function destroy(RencanaAksi $rencanaAksi)
        {

        $rencanaAksi->delete();
        return response()->noContent();
        }

    private function calculateMonthlyStatus(RencanaAksi $aksi, int $month, array $targetMonths): string
    {
        // This check is technically redundant if called after filtering, but good for safety
        if (!in_array($month, $targetMonths)) {
            return 'not_applicable';
        }

        $progressInMonth = $aksi->progressMonitorings->first(); // We eager loaded only the relevant month's progress

        if ($progressInMonth && $progressInMonth->progress_percentage == 100) {
            return 'completed';
        }

        if ($progressInMonth) {
            return 'in_progress';
        }

        // If no progress, check if the reporting period has passed
        $endOfMonth = \Carbon\Carbon::create(date('Y'), $month)->endOfMonth();
        if (now()->gt($endOfMonth)) {
            return 'missed';
        }

        return 'planned';
    }

    }
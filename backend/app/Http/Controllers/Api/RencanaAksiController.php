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
            ->with('assignedTo:id,name');

        // Eager load progress specific to the requested month if provided, otherwise load the latest
        if ($month) {
            $rencanaAksiQuery->with(['progressMonitorings' => function ($query) use ($month) {
                $query->whereMonth('report_date', $month);
            }]);
        } else {
            $rencanaAksiQuery->with('latestProgress');
        }

        // If a month is specified, filter the results at the database level
        if ($month) {
            $rencanaAksiQuery->where(function ($query) use ($month) {
                // Handles cases where a 'months' array is present, regardless of type
                $query->orWhereJsonContains('jadwal_config->months', $month);

                // Handles periodik quarterly
                if (in_array($month, [3, 6, 9, 12])) {
                    $query->orWhere(function ($q) {
                        $q->where('jadwal_tipe', 'periodik')
                          ->where('jadwal_config->interval', 'quarterly');
                    });
                }

                // Handles periodik biannual (semesteran)
                if (in_array($month, [6, 12])) {
                    $query->orWhere(function ($q) {
                        $q->where('jadwal_tipe', 'periodik')
                          ->where('jadwal_config->interval', 'biannual');
                    });
                }
            });
        }

        $rencanaAksi = $rencanaAksiQuery->latest()->get();
        $jadwalService = app(JadwalService::class);



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



    }
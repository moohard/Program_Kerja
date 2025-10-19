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

            $user = $request->user()->load('jabatan');

            $userJabatan = $user->jabatan->nama_jabatan ?? null;

    

            // Base query

            $rencanaAksiQuery = RencanaAksi::where('kegiatan_id', $kegiatanId)

                ->with('assignedTo:id,name')

                ->where('jadwal_tipe', '!=', 'rutin');

    

            // --- Reusable Month Filter Logic ---

            $monthFilterLogic = function ($query) use ($month) {

                $query->where(function ($subQuery) use ($month) {

                    // Rule 1: Handle any task with a 'months' array.

                    $subQuery->orWhere(function ($q) use ($month) {

                        $q->whereIn('jadwal_tipe', ['bulanan', 'periodik', 'insidentil'])

                          ->whereNotNull('jadwal_config->months')

                          ->whereRaw("JSON_CONTAINS(jadwal_config, $month, '$.months')");

                    });

    

                    // Rule 2: Fallback for 'insidentil' without a 'months' array.

                    $subQuery->orWhere(function ($q) use ($month) {

                        $q->where('jadwal_tipe', 'insidentil')

                          ->whereNull('jadwal_config->months')

                          ->whereMonth('target_tanggal', $month);

                    });

    

                    // Rule 3 & 4: Conditional for 'periodik' intervals.

                    if (in_array($month, [3, 6, 9, 12])) {

                        $subQuery->orWhere(function ($q) {

                            $q->where('jadwal_tipe', 'periodik')->where('jadwal_config->periode', 'triwulanan');

                        });

                    }

                    if (in_array($month, [6, 12])) {

                        $subQuery->orWhere(function ($q) {

                            $q->where('jadwal_tipe', 'periodik')->where('jadwal_config->periode', 'semesteran');

                        });

                    }

                });

            };

    

            // --- Apply Filters Based on Role ---

            if (in_array($userJabatan, ['Administrator', 'Ketua'])) {

                // Privileged users: Apply the standard month filter to all results.

                if ($month) {

                    $rencanaAksiQuery->where($monthFilterLogic);

                }

            } else {

                // Non-privileged users: Apply a combined ownership and month filter.

                $rencanaAksiQuery->where(function ($query) use ($user, $month, $monthFilterLogic) {

                    // Condition A: User is the PIC, and the RencanaAksi matches the month filter.

                    $query->where(function ($picQuery) use ($user, $month, $monthFilterLogic) {

                        $picQuery->where('assigned_to', $user->id);

                        if ($month) {

                            $picQuery->where($monthFilterLogic);

                        }

                    });

    

                    // Condition B: User is a Pelaksana on a TodoItem within the selected month.

                    if ($month) {

                        $query->orWhereHas('todoItems', function ($todoQuery) use ($user, $month) {

                            $todoQuery->where('pelaksana_id', $user->id)

                                      ->whereMonth('deadline', $month);

                        });

                    } else {

                        // If no month is selected, show all RAs where the user is a pelaksana.

                        $query->orWhereHas('todoItems', function ($todoQuery) use ($user) {

                            $todoQuery->where('pelaksana_id', $user->id);

                        });

                    }

                });

            }

    

            // Eager load progress specific to the requested month if provided, otherwise load the latest.

            if ($month) {

                $rencanaAksiQuery->with(['progressMonitorings' => function ($query) use ($month) {

                    $query->whereMonth('report_date', $month);

                }]);

            } else {

                $rencanaAksiQuery->with('latestProgress');

            }

    

            $rencanaAksi = $rencanaAksiQuery->latest()->get();

    

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
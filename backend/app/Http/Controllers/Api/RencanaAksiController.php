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
                if ($month) {
                    $rencanaAksiQuery->where($monthFilterLogic);
                }
            } else {
                // For non-privileged users, fetch all RAs they are involved in first.
                $rencanaAksiQuery->where(function ($query) use ($user) {
                    $query->where('assigned_to', $user->id)
                          ->orWhereHas('todoItems', function ($todoQuery) use ($user) {
                              $todoQuery->where('pelaksana_id', $user->id);
                          });
                });
            }

            $rencanaAksi = $rencanaAksiQuery->with('latestProgress', 'progressMonitorings', 'todoItems')->latest()->get();

            // Now, if a month is selected, filter the collection in PHP for non-privileged users
            if ($month && !in_array($userJabatan, ['Administrator', 'Ketua'])) {
                $jadwalService = $this->jadwalService;
                $rencanaAksi = $rencanaAksi->filter(function ($ra) use ($month, $jadwalService, $user) {
                    // Determine the applicable report date for the filtered month
                    $applicableReportDate = $jadwalService->getApplicableReportDate($ra, null, $month);
                    $targetMonths = $jadwalService->getTargetMonths($ra->jadwal_tipe, $ra->jadwal_config);

                    // Check if the month of the applicable report date is in the target months.
                    // This correctly handles quarterly/semester logic.
                    $isMonthRelevant = in_array($applicableReportDate->month, $targetMonths);

                    // Keep if user is PIC and the month is relevant
                    if ($ra->assigned_to == $user->id && $isMonthRelevant) {
                        return true;
                    }

                    // Keep if user is a pelaksana on ANY todo item AND the month is relevant
                    if ($ra->todoItems->where('pelaksana_id', $user->id)->isNotEmpty() && $isMonthRelevant) {
                        return true;
                    }

                    return false;
                });
            }

            // If a month is selected, attach the correct monthly progress
            if ($month) {
                $jadwalService = $this->jadwalService;
                $rencanaAksi->map(function ($ra) use ($month, $jadwalService) {
                    $applicableReportDate = $jadwalService->getApplicableReportDate($ra, null, $month);
                    $ra->monthly_progress = $ra->progressMonitorings->firstWhere('report_date', $applicableReportDate->format('Y-m-d'));

                    // --- LOGGING UNTUK DEBUGGING ---
                    Log::info("Debugging RencanaAksi ID: {$ra->id} untuk Bulan Filter: {$month}");
                    Log::info(" - Tanggal Laporan Dicari: " . $applicableReportDate->format('Y-m-d'));
                    Log::info(" - Progress Ditemukan: " . ($ra->monthly_progress ? "ID {$ra->monthly_progress->id} ({$ra->monthly_progress->progress_percentage}%)" : "Tidak ada"));
                    // --- AKHIR LOGGING ---

                    return $ra;
                });
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
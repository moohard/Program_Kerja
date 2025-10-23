<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RencanaAksi;
use App\Http\Requests\StoreRencanaAksiRequest;
use App\Http\Requests\UpdateRencanaAksiRequest;
use App\Http\Resources\RencanaAksiResource;
use App\Models\ProgressMonitoring;
use App\Models\TodoItem;
use Illuminate\Http\Request;
use App\Models\User;
use App\Notifications\RencanaAksiAssigned;
use App\Services\JadwalService;
use Illuminate\Support\Facades\DB;
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
                $user = $request->user();
        
                // 1. Base query - LOAD SEMUA PROGRESS untuk perhitungan keseluruhan
                $rencanaAksiQuery = RencanaAksi::where('kegiatan_id', $kegiatanId)
                    ->with([
                        'assignedTo:id,name', 
                        'progressMonitorings', // SEMUA progress untuk overall calculation
                        'todoItems'
                    ])
                    ->where('jadwal_tipe', '!=', 'rutin');
        
                // 2. Apply authorization filter
                if (!$user->can('view all data')) {
                    $rencanaAksiQuery->where(function ($query) use ($user) {
                        $query->where('assigned_to', $user->id)
                              ->orWhereHas('todoItems', function ($todoQuery) use ($user) {
                                  $todoQuery->where('pelaksana_id', $user->id);
                              });
                    });
                }
        
                // 3. Fetch data
                $rencanaAksi = $rencanaAksiQuery->latest()->get();
        
                // 4. Handle monthly filter - BUAT DATA TERPISAH untuk tampilan bulanan
                if ($month) {
                    $jadwalService = $this->jadwalService;
        
                    // Filter RencanaAksi yang memiliki target di bulan tersebut
                    $rencanaAksi = $rencanaAksi->filter(function ($ra) use ($month, $jadwalService) {
                        $config = $ra->jadwal_config ?? []; // Ensure config is an array
                        $targetMonths = $jadwalService->getTargetMonths($ra->jadwal_tipe, $config);
                        return in_array($month, $targetMonths);
                    });
        
                    // Tambahkan progress khusus untuk bulan yang difilter
                    $rencanaAksi->map(function ($ra) use ($month, $jadwalService) {
                        $applicableReportDate = $jadwalService->getApplicableReportDate($ra, null, $month);
                        
                        $progressForMonth = $ra->progressMonitorings
                            ->where('report_date', $applicableReportDate->format('Y-m-d'))
                            ->sortByDesc('tanggal_monitoring')
                            ->first();
        
                        // Simpan sebagai atribut terpisah, jangan ganggu relationship utama
                        $ra->filtered_monthly_progress = $progressForMonth ?: (object) [
                            'progress_percentage' => 0, 
                            'is_late' => false, 
                            'catatan' => 'Belum ada laporan untuk bulan ini.', 
                            'report_date' => $applicableReportDate->format('Y-m-d'),
                        ];
        
                        return $ra;
                    });
                } else {
                    // Untuk view "All Months", gunakan progress terbaru sebagai filtered progress
                    $rencanaAksi->map(function ($ra) {
                        $latestProgress = $ra->progressMonitorings->sortByDesc('tanggal_monitoring')->first();
                        
                        $ra->filtered_monthly_progress = $latestProgress ?: (object) [
                            'progress_percentage' => 0, 
                            'is_late' => false, 
                            'catatan' => 'Belum ada laporan.', 
                            'report_date' => null,
                        ];
                        return $ra;
                    });
                }
        
                return RencanaAksiResource::collection($rencanaAksi);
            }
    public function store(StoreRencanaAksiRequest $request)
    {
        $this->authorize('create', RencanaAksi::class);

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
        $this->authorize('update', $rencanaAksi);

        $originalPicId = $rencanaAksi->assigned_to;
        $validated = $request->validated();

        // Validasi jadwal_config menggunakan JadwalService
        if (isset($validated['jadwal_tipe']) && isset($validated['jadwal_config'])) {
            $this->jadwalService->validateConfig($validated['jadwal_config'], $validated['jadwal_tipe']);
        }

        // [NEW LOGIC] Wrap in transaction to ensure data integrity
        DB::transaction(function () use ($rencanaAksi, $validated) {
            $rencanaAksi->update($validated);

            // [FIX] Use the model directly to ensure deletion regardless of loaded relationships.
            TodoItem::where('rencana_aksi_id', $rencanaAksi->id)->delete();
            ProgressMonitoring::where('rencana_aksi_id', $rencanaAksi->id)->delete();

            // Reset status to 'planned'
            $rencanaAksi->fresh()->update(['status' => 'planned', 'actual_tanggal' => null]);
        });

        try {
            $assignedUserId = $validated['assigned_to'] ?? null;
            // Kirim notifikasi HANYA jika PIC berubah dan tidak kosong
            if ($assignedUserId && $assignedUserId != $originalPicId) {
                $userToNotify = User::find($assignedUserId);
                if ($userToNotify) {
                    $userToNotify->notify(new RencanaAksiAssigned($rencanaAksi));
                }
            }
        } catch (\Exception $e) {
            \Log::error('FCM Notification failed during RencanaAksi update: ' . $e->getMessage());
        }

        return new RencanaAksiResource(RencanaAksi::with(['assignedTo', 'progressMonitorings', 'latestProgress'])->findOrFail($rencanaAksi->id));
    }

    public function destroy(RencanaAksi $rencanaAksi)
    {
        $this->authorize('delete', $rencanaAksi);

        $rencanaAksi->delete();
        return response()->noContent();
    }



    }
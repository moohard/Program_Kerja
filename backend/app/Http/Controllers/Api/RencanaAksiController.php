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
class RencanaAksiController extends Controller
    {

    public function index(Request $request)
        {

        $request->validate(['kegiatan_id' => 'required|exists:kegiatan,id']);

        $rencanaAksi = RencanaAksi::where('kegiatan_id', $request->kegiatan_id)
            ->with(['assignedTo:id,name', 'progressMonitorings.attachments', 'latestProgress'])
            ->latest()
            ->get();

        return RencanaAksiResource::collection($rencanaAksi);
        }

    public function store(StoreRencanaAksiRequest $request)
        {
        $validated   = $request->validated();
        $rencanaAksi = RencanaAksi::create($validated);

        try {
            // [FIX] Menggunakan 'assigned_to' dari data yang divalidasi
            $assignedUserId = $validated['assigned_to'] ?? NULL;

            \Log::info("--- DEBUG NOTIFIKASI (STORE) ---");
            \Log::info("Mencari User dengan ID: " . ($assignedUserId ?? 'NULL'));

            if ($assignedUserId) {
                $userToNotify = User::find($assignedUserId);

                if ($userToNotify) {
                    \Log::info("User ditemukan: " . $userToNotify->name);

                    $tokenCount = $userToNotify->deviceTokens()->count();
                    \Log::info("Jumlah token untuk user ini: " . $tokenCount);

                    if ($tokenCount > 0) {
                        \Log::info("MEMICU PENGIRIMAN NOTIFIKASI...");
                        $userToNotify->notify(new RencanaAksiAssigned($rencanaAksi));
                        \Log::info("Notifikasi telah diserahkan ke Laravel.");
                        }
                    else {
                        \Log::info("Tidak ada token, notifikasi tidak dikirim.");
                        }

                    }
                else {
                    \Log::info("User dengan ID " . $assignedUserId . " tidak ditemukan.");
                    }
                }
            else {
                \Log::info("Tidak ada user yang ditugaskan (assigned_to is null).");
                }
            \Log::info("--- AKHIR DEBUG ---");

            }
        catch (\Exception $e) {
            \Log::error('FCM Notification failed during store: ' . $e->getMessage());
            }

        return new RencanaAksiResource($rencanaAksi);
        }

    public function show(RencanaAksi $rencanaAksi)
        {

        return new RencanaAksiResource($rencanaAksi->load(relations: 'assignedTo'));
        }

    public function update(UpdateRencanaAksiRequest $request, RencanaAksi $rencanaAksi)
        {
        $validated = $request->validated();
        $rencanaAksi->update($validated);

        try {
            // [FIX] Menggunakan 'assigned_to' dari data yang baru divalidasi
            $assignedUserId = $validated['assigned_to'] ?? NULL;

            \Log::info("--- DEBUG NOTIFIKASI (UPDATE) ---");
            \Log::info("Mencari User dengan ID: " . ($assignedUserId ?? 'NULL'));

            if ($assignedUserId) {
                $userToNotify = User::find($assignedUserId);

                if ($userToNotify) {
                    \Log::info("User ditemukan: " . $userToNotify->name);

                    $tokenCount = $userToNotify->deviceTokens()->count();
                    \Log::info("Jumlah token untuk user ini: " . $tokenCount);

                    if ($tokenCount > 0) {
                        \Log::info("MEMICU PENGIRIMAN NOTIFIKASI...");
                        $userToNotify->notify(new RencanaAksiAssigned($rencanaAksi));
                        \Log::info("Notifikasi telah diserahkan ke Laravel.");
                        }
                    else {
                        \Log::info("Tidak ada token, notifikasi tidak dikirim.");
                        }
                    }
                else {
                    \Log::info("User dengan ID " . $assignedUserId . " tidak ditemukan.");
                    }
                }
            else {
                \Log::info("Tidak ada user yang ditugaskan (assigned_to is null).");
                }
            \Log::info("--- AKHIR DEBUG ---");

            }
        catch (\Exception $e) {
            \Log::error('FCM Notification failed during update: ' . $e->getMessage());
            }

        return new RencanaAksiResource($rencanaAksi->refresh()); // refresh() untuk mendapatkan data terbaru
        }

    public function destroy(RencanaAksi $rencanaAksi)
        {

        $rencanaAksi->delete();
        return response()->noContent();
        }

    }
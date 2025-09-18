<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RencanaAksi;
use App\Http\Requests\StoreRencanaAksiRequest;
use App\Http\Requests\UpdateRencanaAksiRequest;
use App\Http\Resources\RencanaAksiResource;
use Illuminate\Http\Request;

class RencanaAksiController extends Controller
{
    public function index(Request $request)
    {
        $request->validate(['kegiatan_id' => 'required|exists:kegiatan,id']);
        
        $rencanaAksi = RencanaAksi::where('kegiatan_id', $request->kegiatan_id)
            ->with(['assignedTo:id,name', 'progressMonitorings.attachments'])
            ->latest()
            ->get();
            
        return RencanaAksiResource::collection($rencanaAksi);
    }

    public function store(StoreRencanaAksiRequest $request)
    {
        $validated = $request->validated();

        // Ambil bulan-bulan yang dijadwalkan dan urutkan
        $months = $validated['schedule_months'];
        sort($months);

        $rencanaAksi = RencanaAksi::create([
            'kegiatan_id' => $validated['kegiatan_id'],
            'deskripsi_aksi' => $validated['deskripsi_aksi'],
            'assigned_to' => $validated['assigned_to'],
            'priority' => $validated['priority'],
            'catatan' => $validated['catatan'],
            'jadwal_tipe' => 'periodik', // Asumsikan tipe periodik untuk multi-bulan
            'jadwal_config' => ['months' => $months],
            // Set target_tanggal ke hari pertama dari bulan pertama yang dipilih
            'target_tanggal' => "{$validated['year']}-{$months[0]}-01",
        ]);

        return new RencanaAksiResource($rencanaAksi);
    }

    public function show(RencanaAksi $rencanaAksi)
    {
        return new RencanaAksiResource($rencanaAksi->load(relations: 'assignedTo'));
    }

    public function update(UpdateRencanaAksiRequest $request, RencanaAksi $rencanaAksi)
    {
        $validated = $request->validated();
        
        // Jika ada jadwal baru, proses seperti saat 'store'
        if (isset($validated['schedule_months'])) {
            $months = $validated['schedule_months'];
            sort($months);

            $validated['jadwal_config'] = ['months' => $months];
            $year = $validated['year'] ?? date('Y', strtotime($rencanaAksi->target_tanggal));
            $validated['target_tanggal'] = "{$year}-{$months[0]}-01";
        }
        
        $rencanaAksi->update($validated);

        return new RencanaAksiResource($rencanaAksi);
    }

    public function destroy(RencanaAksi $rencanaAksi)
    {
        $rencanaAksi->delete();
        return response()->noContent();
    }
}
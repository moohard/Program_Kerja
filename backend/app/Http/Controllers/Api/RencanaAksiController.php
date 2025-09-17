<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRencanaAksiRequest;
use App\Http\Requests\UpdateRencanaAksiRequest;
use App\Http\Resources\RencanaAksiResource;
use App\Models\RencanaAksi;
use Illuminate\Http\Request;

class RencanaAksiController extends Controller
{

    public function index(Request $request)
    {

        $request->validate([ 'kegiatan_id' => 'required|exists:kegiatan,id' ]);

        $rencanaAksi = RencanaAksi::with([ 'assignedUser', 'latestProgress' ])
            ->where('kegiatan_id', $request->kegiatan_id)
            ->orderBy('nomor_aksi', 'asc')
            ->get();

        return RencanaAksiResource::collection($rencanaAksi);
    }

    public function store(StoreRencanaAksiRequest $request)
    {

        $rencanaAksi = RencanaAksi::create($request->validated());
        return new RencanaAksiResource($rencanaAksi);
    }

    public function show(RencanaAksi $rencanaAksi)
    {

        return new RencanaAksiResource($rencanaAksi->load([ 'kegiatan', 'assignedUser' ]));
    }

    public function update(UpdateRencanaAksiRequest $request, RencanaAksi $rencanaAksi)
    {

        $rencanaAksi->update($request->validated());
        return new RencanaAksiResource($rencanaAksi);
    }

    public function destroy(RencanaAksi $rencanaAksi)
    {

        $rencanaAksi->delete();
        return response()->noContent();
    }

}

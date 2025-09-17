<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreKegiatanRequest;
use App\Http\Requests\UpdateKegiatanRequest;
use App\Http\Resources\KegiatanResource;
use App\Models\Kegiatan;
use App\Models\KategoriUtama;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class KegiatanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $request->validate([
            'kategori_id' => 'sometimes|integer|exists:kategori_utama,id'
        ]);

        $query = Kegiatan::query()->with('kategoriUtama');

        if ($request->has('kategori_id')) {
            $query->where('kategori_id', $request->kategori_id);
        }

        return KegiatanResource::collection($query->orderBy('created_at', 'desc')->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreKegiatanRequest $request)
    {
        $kegiatan = Kegiatan::create($request->validated());
        return new KegiatanResource($kegiatan);
    }

    /**
     * Display the specified resource.
     */
    public function show(Kegiatan $kegiatan)
    {
        return new KegiatanResource($kegiatan->load('kategoriUtama'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateKegiatanRequest $request, Kegiatan $kegiatan)
    {
        $kegiatan->update($request->validated());
        return new KegiatanResource($kegiatan);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Kegiatan $kegiatan)
    {
        $kegiatan->delete();
        return response()->noContent();
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\KategoriUtamaResource;
use App\Models\KategoriUtama;
use App\Models\ProgramKerja;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class KategoriUtamaController extends Controller
{

    public function index(Request $request)
    {
        $programKerjaId = $request->input('program_kerja_id');

        if (!$programKerjaId) {
            $activeProgram = ProgramKerja::where('is_aktif', TRUE)->first();
            if (!$activeProgram) {
                return KategoriUtamaResource::collection(collect());
            }
            $programKerjaId = $activeProgram->id;
        }

        $cacheKey = 'kategori_utama_list_' . $programKerjaId;
        $kategori = Cache::remember($cacheKey, 3600, function () use ($programKerjaId) {
            return KategoriUtama::where('program_kerja_id', $programKerjaId)->orderBy('nomor')->get();
        });

        return KategoriUtamaResource::collection($kategori);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'program_kerja_id' => 'sometimes|required|exists:program_kerja,id',
            'nomor'              => 'required|integer',
            'nama_kategori'      => 'required|string|max:255',
        ]);

        if (!isset($validated['program_kerja_id'])) {
            $activeProgram = ProgramKerja::where('is_aktif', TRUE)->first();
            if (!$activeProgram) {
                return response()->json(['message' => 'Tidak ada program kerja aktif.'], 422);
            }
            $validated['program_kerja_id'] = $activeProgram->id;
        }

        $kategori = KategoriUtama::create($validated);

        Cache::forget('kategori_utama_list_' . $validated['program_kerja_id']);

        return (new KategoriUtamaResource($kategori))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(KategoriUtama $kategoriUtama)
    {
        return new KategoriUtamaResource($kategoriUtama);
    }

    public function update(Request $request, KategoriUtama $kategoriUtama)
    {
        $validated = $request->validate([
            'nomor'         => 'sometimes|required|integer',
            'nama_kategori' => 'sometimes|required|string|max:255',
            'is_active'     => 'sometimes|boolean',
        ]);

        $kategoriUtama->update($validated);

        Cache::forget('kategori_utama_list_' . $kategoriUtama->program_kerja_id);

        return new KategoriUtamaResource($kategoriUtama);
    }

    public function destroy(KategoriUtama $kategoriUtama)
    {
        $programKerjaId = $kategoriUtama->program_kerja_id;
        $kategoriUtama->delete();
        Cache::forget('kategori_utama_list_' . $programKerjaId);
        return response()->json(NULL, Response::HTTP_NO_CONTENT);
    }

}

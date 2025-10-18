<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\KategoriUtamaResource;
use App\Models\KategoriUtama;
use App\Models\ProgramKerja;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class KategoriUtamaController extends Controller
{

    public function index(Request $request)
    {
        $programKerjaId = $request->input('program_kerja_id');

        $query = KategoriUtama::query();

        if ($programKerjaId) {
            $query->where('program_kerja_id', $programKerjaId);
        } else {
            $activeProgram = ProgramKerja::where('is_aktif', TRUE)->first();
            if (!$activeProgram) {
                return KategoriUtamaResource::collection(collect());
            }
            $query->where('program_kerja_id', $activeProgram->id);
        }

        $kategori = $query->orderBy('nomor')->get();

        return KategoriUtamaResource::collection($kategori);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'program_kerja_id' => 'required|exists:program_kerja,id',
            'nomor'              => 'required|integer',
            'nama_kategori'      => 'required|string|max:255',
        ]);

        $kategori = KategoriUtama::create($validated);

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

        return new KategoriUtamaResource($kategoriUtama);
    }

    public function destroy(KategoriUtama $kategoriUtama)
    {
        $kategoriUtama->delete();
        return response()->json(NULL, Response::HTTP_NO_CONTENT);
    }

}

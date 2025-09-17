<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KategoriUtama;
use App\Models\ProgramKerja;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class KategoriUtamaController extends Controller
{

    public function index()
    {

        // Ambil program kerja yang aktif
        $activeProgram = ProgramKerja::where('is_aktif', TRUE)->first();

        if (!$activeProgram)
        {
            return response()->json([ 'data' => [] ]);
        }

        // Tampilkan kategori dari program kerja yang aktif
        $kategori = KategoriUtama::where('program_kerja_id', $activeProgram->id)
            ->orderBy('nomor')
            ->get();

        return response()->json([ 'data' => $kategori ]);
    }

    public function store(Request $request)
    {

        $validated = $request->validate([
            'nomor'         => 'required|integer',
            'nama_kategori' => 'required|string|max:255',
        ]);

        $activeProgram = ProgramKerja::where('is_aktif', TRUE)->firstOrFail();

        $kategori = $activeProgram->kategoriUtama()->create($validated);

        return response()->json($kategori, Response::HTTP_CREATED);
    }

    public function show(KategoriUtama $kategoriUtama)
    {

        return response()->json($kategoriUtama);
    }

    public function update(Request $request, KategoriUtama $kategoriUtama)
    {

        $validated = $request->validate([
            'nomor'         => 'required|integer',
            'nama_kategori' => 'required|string|max:255',
            'is_active'     => 'sometimes|boolean',
        ]);

        $kategoriUtama->update($validated);

        return response()->json($kategoriUtama);
    }

    public function destroy(KategoriUtama $kategoriUtama)
    {

        $kategoriUtama->delete();
        return response()->json(NULL, Response::HTTP_NO_CONTENT);
    }

}

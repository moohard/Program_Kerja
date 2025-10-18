<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProgramKerjaRequest;
use App\Http\Requests\UpdateProgramKerjaRequest;
use App\Http\Resources\ProgramKerjaResource;
use App\Models\ProgramKerja;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class ProgramKerjaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $programKerja = Cache::remember('program_kerja_list', 86400, function () {
            return ProgramKerja::orderBy('tahun', 'desc')->get();
        });
        return ProgramKerjaResource::collection($programKerja);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProgramKerjaRequest $request)
    {
        $validated = $request->validated();

        $programKerja = DB::transaction(function () use ($validated) {
            if (!empty($validated['is_aktif']) && $validated['is_aktif']) {
                ProgramKerja::where('is_aktif', true)->update(['is_aktif' => false]);
            }

            return ProgramKerja::create($validated);
        });

        Cache::forget('program_kerja_list');

        return new ProgramKerjaResource($programKerja);
    }

    /**
     * Display the specified resource.
     */
    public function show(ProgramKerja $programKerja)
    {
        return new ProgramKerjaResource($programKerja);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProgramKerjaRequest $request, ProgramKerja $programKerja)
    {
        $validated = $request->validated();

        DB::transaction(function () use ($programKerja, $validated) {
            if (!empty($validated['is_aktif']) && $validated['is_aktif']) {
                ProgramKerja::where('id', '!=', $programKerja->id)
                    ->where('is_aktif', true)
                    ->update(['is_aktif' => false]);
            }

            $programKerja->update($validated);
        });

        Cache::forget('program_kerja_list');

        return new ProgramKerjaResource($programKerja->fresh());
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ProgramKerja $programKerja)
    {
        // Optional: Add logic to prevent deletion of active program kerja
        if ($programKerja->is_aktif) {
            return response()->json(['message' => 'Tidak dapat menghapus program kerja yang aktif.'], 422);
        }
        
        $programKerja->delete();
        Cache::forget('program_kerja_list');
        return response()->noContent();
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreJabatanRequest;
use App\Http\Requests\UpdateJabatanRequest;
use App\Http\Resources\JabatanResource;
use App\Models\Jabatan;
use Illuminate\Http\Request;

class JabatanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Eager load parent and children for hierarchical data
        $jabatan = Jabatan::with(['parent', 'children'])->latest()->paginate(100);
        return JabatanResource::collection($jabatan);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreJabatanRequest $request)
    {
        $jabatan = Jabatan::create($request->validated());
        return new JabatanResource($jabatan);
    }

    /**
     * Display the specified resource.
     */
    public function show(Jabatan $jabatan)
    {
        return new JabatanResource($jabatan->load(['parent', 'children']));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateJabatanRequest $request, Jabatan $jabatan)
    {
        $jabatan->update($request->validated());
        return new JabatanResource($jabatan);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Jabatan $jabatan)
    {
        // Add logic to handle children if necessary, e.g., re-assign them.
        // For now, we'll just delete. Add a check if it has users assigned.
        if ($jabatan->users()->count() > 0) {
            return response()->json(['message' => 'Tidak dapat menghapus jabatan yang masih memiliki user.'], 422);
        }

        $jabatan->delete();
        return response()->noContent();
    }
}

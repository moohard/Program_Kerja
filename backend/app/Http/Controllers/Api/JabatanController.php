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
        // Revert to fetching a flat list for the table view, eager load parent for display
        $jabatan = Jabatan::with(['parent', 'users'])->latest()->paginate(100);
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
    public function update(UpdateJabatanRequest $request, Jabatan $jabatanItem)
    {
        $jabatanItem->update($request->validated());
        return new JabatanResource($jabatanItem);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Jabatan $jabatanItem)
    {
        // Add logic to handle children if necessary, e.g., re-assign them.
        // For now, we'll just delete. Add a check if it has users assigned.
        if ($jabatanItem->users()->count() > 0) {
            return response()->json(['message' => 'Tidak dapat menghapus jabatan yang masih memiliki user.'], 422);
        }

        $jabatanItem->delete();
        return response()->noContent();
    }

    /**
     * Fetch assignable jabatan tree for the current user.
     * Only returns the user's own jabatan and its descendants.
     */
    public function getAssignableTree(Request $request)
    {
        $user = $request->user();
        if (!$user->jabatan_id) {
            // If user has no jabatan, return empty array or handle as per business logic
            // For a super admin, maybe return the whole tree? For now, return empty.
            $rootJabatan = Jabatan::whereNull('parent_id')->with('users')->get();
            $tree = $this->buildTree($rootJabatan);
            return response()->json($tree);
        }

        // Fetch the user's own jabatan and eager load its children recursively
        $userJabatan = Jabatan::with('users')->find($user->jabatan_id);

        if (!$userJabatan) {
            return response()->json([]);
        }

        // Build the tree starting from the user's own jabatan
        $tree = $this->buildTree([$userJabatan]);

        return response()->json($tree);
    }

    /**
     * Recursively build the jabatan tree.
     */
    private function buildTree($jabatans)
    {
        $tree = [];
        foreach ($jabatans as $jabatan) {
            $children = $this->buildTree($jabatan->children()->with('users')->get());
            $data = [
                'id' => $jabatan->id,
                'nama_jabatan' => $jabatan->nama_jabatan,
                'users' => $jabatan->users->map(fn ($user) => ['id' => $user->id, 'name' => $user->name]),
                'children' => $children,
            ];
            $tree[] = $data;
        }
        return $tree;
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Jabatan;
use App\Http\Resources\JabatanResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

class JabatanController extends Controller
{
    /**
     * Display a listing of the resource in a hierarchical tree structure,
     * filtered based on the authenticated user's department (bidang).
     */
    public function index()
    {
        $user = Auth::user();
        $userJabatan = $user->jabatan;

        if (!$userJabatan) {
            return JabatanResource::collection([]);
        }

        $cacheKey = 'jabatan_tree_' . ($userJabatan->bidang ?? 'none');
        $cacheDuration = 3600; // 60 minutes

        $jabatan = Cache::remember($cacheKey, $cacheDuration, function () use ($userJabatan) {
            // Fungsi rekursif untuk eager load children dan users
            $recursiveLoad = function ($query) {
                $query->with([
                    'users:id,name,jabatan_id',
                    'children' => fn ($q) => $q->with(['users:id,name,jabatan_id', 'children' => $GLOBALS['recursiveLoad']])
                ]);
            };
            $GLOBALS['recursiveLoad'] = $recursiveLoad;

            // Query dasar: selalu kecualikan bidang 'teknis'
            $baseQuery = Jabatan::where('bidang', '!=', 'teknis');

            // Tentukan jabatan root berdasarkan bidang pengguna
            if ($userJabatan->bidang === 'pimpinan') {
                // Pimpinan melihat semua kecuali teknis
                $result = $baseQuery->whereNull('parent_id')
                    ->with(['users:id,name,jabatan_id', 'children' => $recursiveLoad])
                    ->get();
            } else {
                // Pengguna lain hanya melihat pohon dari bidang mereka sendiri
                $result = $baseQuery->where('bidang', $userJabatan->bidang)
                    ->whereNull('parent_id') // Mulai dari root bidang tersebut
                    ->with(['users:id,name,jabatan_id', 'children' => $recursiveLoad])
                    ->get();
            }

            unset($GLOBALS['recursiveLoad']);

            return $result;
        });

        return JabatanResource::collection($jabatan);
    }
}
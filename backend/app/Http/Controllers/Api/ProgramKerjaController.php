<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProgramKerja;
use Illuminate\Http\Request;

class ProgramKerjaController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $programKerja = ProgramKerja::select(['id', 'tahun', 'is_aktif'])->orderBy('tahun', 'desc')->get();
        return response()->json($programKerja);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\RencanaAksiImport;
use App\Exports\RencanaAksiTemplateExport; // Kita akan buat file ini selanjutnya
use Illuminate\Support\Facades\Validator;


class ImportExportController extends Controller
{
    public function importRencanaAksi(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|mimes:xlsx,xls',
            'kegiatan_id' => 'required|integer|exists:kegiatan,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            Excel::import(new RencanaAksiImport($request->kegiatan_id), $request->file('file'));
            return response()->json(['message' => 'Data Rencana Aksi berhasil diimpor!'], 200);
        } catch (\Maatwebsite\Excel\Validators\ValidationException $e) {
             $failures = $e->failures();
             $errors = [];
             foreach ($failures as $failure) {
                 $errors[] = 'Baris ' . $failure->row() . ': ' . implode(', ', $failure->errors());
             }
             return response()->json(['message' => 'Terdapat error pada file Anda.', 'errors' => $errors], 422);
        }
    }

    public function exportRencanaAksiTemplate()
    {
        return Excel::download(new RencanaAksiTemplateExport, 'template_rencana_aksi.xlsx');
    }
}
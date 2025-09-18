<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProgramTemplate;
use App\Models\ProgramKerja;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class TemplateController extends Controller
{

    public function index()
    {

        return ProgramTemplate::orderBy('tahun_referensi', 'desc')->get();
    }

    public function getSourceYears()
    {

        // Menyediakan daftar tahun yang sudah memiliki program kerja
        return ProgramKerja::select('tahun')->distinct()->orderBy('tahun', 'desc')->get();
    }

    public function store(Request $request)
    {

        $validated = $request->validate([
            'nama_template'   => 'required|string|max:255',
            'tahun_referensi' => [
                'required',
                'integer',
                'digits:4',
                Rule::exists('program_kerja', 'tahun'),
            ],
        ]);

        $template = ProgramTemplate::create($validated);

        return response()->json($template, 201);
    }

    public function destroy(ProgramTemplate $template)
    {

        $template->delete();
        return response()->noContent();
    }

    public function apply(Request $request, ProgramTemplate $template)
    {

        $validated = $request->validate([
            'target_year' => 'required|integer|digits:4|unique:program_kerja,tahun',
        ]);

        $sourceProgram = ProgramKerja::where('tahun', $template->tahun_referensi)
            ->with('kategoriUtama.kegiatan.rencanaAksi')
            ->firstOrFail();

        DB::beginTransaction();
        try
        {
            // 1. Buat Program Kerja baru untuk tahun target
            $newProgram = ProgramKerja::create([
                'tahun'           => $validated['target_year'],
                'nama_pengadilan' => $sourceProgram->nama_pengadilan,
                'is_aktif'        => FALSE,
            ]);

            // 2. Salin semua struktur dari program sumber
            foreach ($sourceProgram->kategoriUtama as $kategori)
            {
                $newKategori = $newProgram->kategoriUtama()->create($kategori->only([ 'nomor', 'nama_kategori' ]));

                foreach ($kategori->kegiatan as $kegiatan)
                {
                    $newKegiatan = $newKategori->kegiatan()->create($kegiatan->only([ 'nama_kegiatan' ]));

                    foreach ($kegiatan->rencanaAksi as $aksi)
                    {
                        $newAksiData = $aksi->only([
                            'nomor_aksi',
                            'deskripsi_aksi',
                            'catatan',
                            'assigned_to',
                            'jadwal_tipe',
                            'jadwal_config',
                            'priority',
                        ]);
                        // Reset status, tanggal, dan target tanggal baru
                        $newAksiData['status']         = 'planned';
                        $newAksiData['actual_tanggal'] = NULL;
                        if (isset($newAksiData['jadwal_config']['months'][0]))
                        {
                            $firstMonth                    = $newAksiData['jadwal_config']['months'][0];
                            $newAksiData['target_tanggal'] = "{$validated['target_year']}-{$firstMonth}-01";
                        }

                        $newKegiatan->rencanaAksi()->create($newAksiData);
                    }
                }
            }

            DB::commit();
            return response()->json([ 'message' => "Template '{$template->nama_template}' berhasil diterapkan untuk tahun {$validated['target_year']}." ], 201);

        } catch (\Exception $e)
        {
            DB::rollBack();
            \Log::error("Gagal menerapkan template: " . $e->getMessage());
            return response()->json([ 'message' => 'Terjadi kesalahan saat menerapkan template.' ], 500);
        }
    }

}

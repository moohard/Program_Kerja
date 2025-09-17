<?php

// database/seeders/ProgramTemplateSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProgramTemplateSeeder extends Seeder
{

    public function run()
    {

        $program2025 = DB::table('program_kerja')
            ->where('tahun', 2025)
            ->first();

        // Create template based on 2025 program
        $templateId = DB::table('program_templates')->insertGetId([
            'nama_template'   => 'Template Program Kerja 2025',
            'tahun_referensi' => 2025,
            'is_default'      => TRUE,
            'created_at'      => now(),
            'updated_at'      => now(),
        ]);

        // Get categories from 2025 program
        $categories = DB::table('kategori_utama')
            ->where('program_kerja_id', $program2025->id)
            ->get();

        $templateDetails = [];

        foreach ($categories as $category)
        {
            $templateDetails[] = [
                'template_id'       => $templateId,
                'kategori_utama_id' => $category->id,
                'created_at'        => now(),
                'updated_at'        => now(),
            ];
        }

        DB::table('template_details')->insert($templateDetails);
        $this->command->info('Data program template berhasil ditambahkan!');
    }

}

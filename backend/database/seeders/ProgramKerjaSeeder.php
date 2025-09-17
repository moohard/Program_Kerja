<?php
// database/seeders/ProgramKerjaSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProgramKerjaSeeder extends Seeder
{
    public function run()
    {
        DB::table('program_kerja')->insert([
            [
                'tahun' => 2025,
                'nama_pengadilan' => 'Pengadilan Agama Penajam',
                'is_aktif' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'tahun' => 2024,
                'nama_pengadilan' => 'Pengadilan Agama Penajam',
                'is_aktif' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        $this->command->info('Data program kerja berhasil ditambahkan!');
    }
}

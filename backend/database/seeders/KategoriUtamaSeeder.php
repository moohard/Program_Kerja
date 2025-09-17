<?php
// database/seeders/KategoriUtamaSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class KategoriUtamaSeeder extends Seeder
{
    public function run()
    {
        $programKerja2025 = DB::table('program_kerja')
            ->where('tahun', 2025)
            ->first();

        $kategori = [
            ['TEKNIS YUSTISIAL', 1],
            ['MANAJEMEN PERADILAN', 2],
            ['PELAKSANAAN REFORMASI BIROKRASI', 3],
            ['PEMBANGUNAN ZONA INTEGRITAS', 4],
            ['PEMBINAAN', 5],
            ['PENGAWASAN', 6],
            ['LAYANAN PUBLIK', 7],
            ['PELAKSANAAN ADMINISTRASI KEPANITERAAN', 8],
            ['PERSIDANGAN', 9],
            ['Administrasi Kesekretariatan (Pengelolaan Umum dan Keuangan)', 10],
            ['PENGELOLAAN PERENCANAAN, TEKNOLOGI INFORMASI DAN PELAPORAN', 11],
            ['Administrasi Kesekretariatan (Pengelolaan Kepegawaian Organisasi dan Tatalaksana)', 12]
        ];

        $data = [];
        foreach ($kategori as $item) {
            $data[] = [
                'program_kerja_id' => $programKerja2025->id,
                'nomor' => $item[1],
                'nama_kategori' => $item[0],
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        DB::table('kategori_utama')->insert($data);
        $this->command->info('Data kategori utama berhasil ditambahkan!');
    }
}

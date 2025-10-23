<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class JabatanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Nonaktifkan foreign key checks untuk truncate dan insert
        Schema::disableForeignKeyConstraints();
        DB::table('jabatan')->truncate();

        $jabatans = [
            ['id' => 1, 'parent_id' => null, 'nama_jabatan' => 'Administrator', 'role' => 'admin', 'bidang' => 'teknis'],
            ['id' => 2, 'parent_id' => null, 'nama_jabatan' => 'Ketua', 'role' => 'manajer', 'bidang' => 'pimpinan'],
            ['id' => 3, 'parent_id' => 2, 'nama_jabatan' => 'Wakil Ketua', 'role' => 'manajer', 'bidang' => 'pimpinan'],
            ['id' => 4, 'parent_id' => 3, 'nama_jabatan' => 'Hakim', 'role' => 'manajer', 'bidang' => 'hakim'],
            ['id' => 5, 'parent_id' => 3, 'nama_jabatan' => 'Sekretaris', 'role' => 'manajer', 'bidang' => 'kesekretariatan'],
            ['id' => 6, 'parent_id' => 5, 'nama_jabatan' => 'Kepala Sub Bagian Umum dan Keuangan', 'role' => 'pengawas', 'bidang' => 'kesekretariatan'],
            ['id' => 7, 'parent_id' => 6, 'nama_jabatan' => 'Pelaksana Umum dan Keuangan', 'role' => 'staff', 'bidang' => 'kesekretariatan'],
            ['id' => 8, 'parent_id' => 3, 'nama_jabatan' => 'Panitera', 'role' => 'manajer', 'bidang' => 'kepaniteraan'],
            ['id' => 9, 'parent_id' => 8, 'nama_jabatan' => 'Panitera Muda Permohonan', 'role' => 'pengawas', 'bidang' => 'kepaniteraan'],
            ['id' => 10, 'parent_id' => 9, 'nama_jabatan' => 'Pelaksana Panitera Muda Permohonan', 'role' => 'staff', 'bidang' => 'kepaniteraan'],
            ['id' => 11, 'parent_id' => 8, 'nama_jabatan' => 'Panitera Pengganti', 'role' => 'staff', 'bidang' => 'kepaniteraan'],
            ['id' => 12, 'parent_id' => 8, 'nama_jabatan' => 'Jurusita', 'role' => 'staff', 'bidang' => 'kepaniteraan'],
            ['id' => 13, 'parent_id' => 8, 'nama_jabatan' => 'Jurusita Pengganti', 'role' => 'staff', 'bidang' => 'kepaniteraan'],
            ['id' => 14, 'parent_id' => 5, 'nama_jabatan' => 'Kepala Sub Bagian Kepegawaian dan Ortala', 'role' => 'admin', 'bidang' => 'kesekretariatan'],
            ['id' => 15, 'parent_id' => 5, 'nama_jabatan' => 'Kepala Sub Bagian Perencanaan, Teknologi Informasi dan Pelaporan', 'role' => 'admin', 'bidang' => 'kesekretariatan'],
            ['id' => 18, 'parent_id' => 14, 'nama_jabatan' => 'Pelaksana Kepegawaian dan Ortala', 'role' => 'admin', 'bidang' => 'kesekretariatan'],
            ['id' => 19, 'parent_id' => 15, 'nama_jabatan' => 'Pelaksana Perencanaan, Teknologi Informasi dan Pelaporan', 'role' => 'admin', 'bidang' => 'kesekretariatan'],
            ['id' => 20, 'parent_id' => 8, 'nama_jabatan' => 'Panitera Muda Gugatan', 'role' => 'admin', 'bidang' => 'kepaniteraan'],
            ['id' => 21, 'parent_id' => 8, 'nama_jabatan' => 'Panitera Muda Hukum', 'role' => 'admin', 'bidang' => 'kepaniteraan'],
            ['id' => 22, 'parent_id' => 20, 'nama_jabatan' => 'Pelaksana Panitera Muda Gugatan', 'role' => 'admin', 'bidang' => 'kepaniteraan'],
            ['id' => 23, 'parent_id' => 21, 'nama_jabatan' => 'Pelaksana Panitera Muda Hukum', 'role' => 'admin', 'bidang' => 'kepaniteraan'],
        ];

        foreach ($jabatans as &$jabatan) {
            $jabatan['created_at'] = now();
            $jabatan['updated_at'] = now();
        }

        DB::table('jabatan')->insert($jabatans);

        // Aktifkan kembali foreign key checks
        Schema::enableForeignKeyConstraints();
    }
}

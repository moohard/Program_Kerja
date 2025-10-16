<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Jabatan;

class JabatanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Kosongkan tabel untuk seeding ulang
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        Jabatan::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        // Bidang Teknis
        Jabatan::create(['nama_jabatan' => 'Administrator', 'role' => 'admin', 'bidang' => 'teknis']);

        // Bidang Pimpinan
        $ketua = Jabatan::create(['nama_jabatan' => 'Ketua', 'role' => 'manajer', 'bidang' => 'pimpinan']);
        Jabatan::create(['parent_id' => $ketua->id, 'nama_jabatan' => 'Wakil Ketua', 'role' => 'manajer', 'bidang' => 'pimpinan']);
        Jabatan::create(['parent_id' => $ketua->id, 'nama_jabatan' => 'Hakim', 'role' => 'manajer', 'bidang' => 'pimpinan']);

        // Bidang Kesekretariatan
        $sekretaris = Jabatan::create(['nama_jabatan' => 'Sekretaris', 'role' => 'manajer', 'bidang' => 'kesekretariatan']);
        $kasubbag = Jabatan::create(['parent_id' => $sekretaris->id, 'nama_jabatan' => 'Kasubbag', 'role' => 'pengawas', 'bidang' => 'kesekretariatan']);
        Jabatan::create(['parent_id' => $kasubbag->id, 'nama_jabatan' => 'Pelaksana Kesekretariatan', 'role' => 'staff', 'bidang' => 'kesekretariatan']);

        // Bidang Kepaniteraan
        $panitera = Jabatan::create(['nama_jabatan' => 'Panitera', 'role' => 'manajer', 'bidang' => 'kepaniteraan']);
        $panmud = Jabatan::create(['parent_id' => $panitera->id, 'nama_jabatan' => 'Panitera Muda (Panmud)', 'role' => 'pengawas', 'bidang' => 'kepaniteraan']);
        Jabatan::create(['parent_id' => $panmud->id, 'nama_jabatan' => 'Pelaksana Kepaniteraan', 'role' => 'staff', 'bidang' => 'kepaniteraan']);
        Jabatan::create(['parent_id' => $panitera->id, 'nama_jabatan' => 'Panitera Pengganti', 'role' => 'staff', 'bidang' => 'kepaniteraan']);
        Jabatan::create(['parent_id' => $panitera->id, 'nama_jabatan' => 'Jurusita', 'role' => 'staff', 'bidang' => 'kepaniteraan']);
        Jabatan::create(['parent_id' => $panitera->id, 'nama_jabatan' => 'Jurusita Pengganti', 'role' => 'staff', 'bidang' => 'kepaniteraan']);
    }
}
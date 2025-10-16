<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\Jabatan; // Import model Jabatan

class UsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ambil id untuk setiap jabatan
        $adminJabatan = Jabatan::where('nama_jabatan', 'Administrator')->first();
        $manajerJabatan = Jabatan::where('nama_jabatan', 'Ketua')->first();
        $staffJabatan = Jabatan::where('nama_jabatan', 'Pelaksana Kesekretariatan')->first();
        $pengawasJabatan = Jabatan::where('nama_jabatan', 'Kasubbag')->first();
        $sekretarisJabatan = Jabatan::where('nama_jabatan', 'Sekretaris')->first();
        $paniteraJabatan = Jabatan::where('nama_jabatan', 'Panitera')->first();


        DB::table('users')->insert([
            [
                'name'       => 'Administrator',
                'email'      => 'admin@pa-penajam.go.id',
                'password'   => Hash::make('password'),
                'jabatan_id' => $adminJabatan->id,
                'is_active'  => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name'       => 'Ketua',
                'email'      => 'ketua@pa-penajam.go.id',
                'password'   => Hash::make('password'),
                'jabatan_id' => $manajerJabatan->id,
                'is_active'  => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name'       => 'Sekretaris',
                'email'      => 'sekretaris@pa-penajam.go.id',
                'password'   => Hash::make('password'),
                'jabatan_id' => $sekretarisJabatan->id,
                'is_active'  => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name'       => 'Panitera',
                'email'      => 'panitera@pa-penajam.go.id',
                'password'   => Hash::make('password'),
                'jabatan_id' => $paniteraJabatan->id,
                'is_active'  => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name'       => 'Staff Pelaksana',
                'email'      => 'staff@pa-penajam.go.id',
                'password'   => Hash::make('password'),
                'jabatan_id' => $staffJabatan->id,
                'is_active'  => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name'       => 'Pengawas',
                'email'      => 'pengawas@pa-penajam.go.id',
                'password'   => Hash::make('password'),
                'jabatan_id' => $pengawasJabatan->id,
                'is_active'  => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        $this->command->info('Data users berhasil ditambahkan!');
    }
}

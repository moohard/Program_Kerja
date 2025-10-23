<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Illuminate\Support\Facades\Schema;

class UsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Nonaktifkan foreign key checks untuk truncate
        Schema::disableForeignKeyConstraints();
        User::truncate();
        DB::table('model_has_roles')->truncate(); // Kosongkan juga tabel relasi role
        Schema::enableForeignKeyConstraints();

        // Buat user dan langsung assign role
        $admin = User::create([
            'name'       => 'Administrator',
            'email'      => 'admin@pa-penajam.go.id',
            'password'   => Hash::make('password'),
            'jabatan_id' => 1, // ID untuk Administrator
            'is_active'  => true,
        ]);
        $admin->assignRole('admin');

        $ketua = User::create([
            'name'       => 'Ketua',
            'email'      => 'ketua@pa-penajam.go.id',
            'password'   => Hash::make('password'),
            'jabatan_id' => 2, // ID untuk Ketua
            'is_active'  => true,
        ]);
        $ketua->assignRole('pimpinan', 'manajer');

        $sekretaris = User::create([
            'name'       => 'Sekretaris',
            'email'      => 'sekretaris@pa-penajam.go.id',
            'password'   => Hash::make('password'),
            'jabatan_id' => 5, // ID untuk Sekretaris
            'is_active'  => true,
        ]);
        $sekretaris->assignRole('manajer', 'staff'); // Contoh multi-role

        $panitera = User::create([
            'name'       => 'Panitera',
            'email'      => 'panitera@pa-penajam.go.id',
            'password'   => Hash::make('password'),
            'jabatan_id' => 8, // ID untuk Panitera
            'is_active'  => true,
        ]);
        $panitera->assignRole('manajer', 'staff');

        $staff = User::create([
            'name'       => 'Staff Pelaksana',
            'email'      => 'staff@pa-penajam.go.id',
            'password'   => Hash::make('password'),
            'jabatan_id' => 7, // ID untuk Pelaksana Umum dan Keuangan
            'is_active'  => true,
        ]);
        $staff->assignRole('staff');

        $pengawas = User::create([
            'name'       => 'Pengawas',
            'email'      => 'pengawas@pa-penajam.go.id',
            'password'   => Hash::make('password'),
            'jabatan_id' => 6, // ID untuk Kepala Sub Bagian Umum dan Keuangan
            'is_active'  => true,
        ]);
        $pengawas->assignRole('pengawas');


        $this->command->info('Data users dan roles berhasil ditambahkan!');
    }
}

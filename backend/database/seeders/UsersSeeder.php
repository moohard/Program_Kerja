<?php

// database/seeders/UsersSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UsersSeeder extends Seeder
{

    public function run()
    {

        DB::table('users')->insert([
            [
                'name'       => 'Administrator',
                'email'      => 'admin@pa-penajam.go.id',
                'password'   => Hash::make('password'),
                'role'       => 'admin',
                'is_active'  => TRUE,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name'       => 'Manajer Program',
                'email'      => 'manajer@pa-penajam.go.id',
                'password'   => Hash::make('password'),
                'role'       => 'manajer',
                'is_active'  => TRUE,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name'       => 'Staff Pelaksana',
                'email'      => 'staff@pa-penajam.go.id',
                'password'   => Hash::make('password'),
                'role'       => 'staff',
                'is_active'  => TRUE,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name'       => 'Pengawas',
                'email'      => 'pengawas@pa-penajam.go.id',
                'password'   => Hash::make('password'),
                'role'       => 'pengawas',
                'is_active'  => TRUE,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        $this->command->info('Data users berhasil ditambahkan!');
    }

}

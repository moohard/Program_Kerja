<?php

// database/seeders/DatabaseSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{

    public function run()
    {
        $this->call([
            ProgramKerjaSeeder::class, // Pindahkan ke atas
            KategoriUtamaSeeder::class,
            KegiatanSeeder::class,
            JabatanSeeder::class,
            RbacSeeder::class,
            UsersSeeder::class,
            RencanaAksiSeeder::class,
            ProgramTemplateSeeder::class,
        ]);

        $this->command->info('Semua data seed berhasil ditambahkan!');
    }

}

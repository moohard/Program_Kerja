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
            JabatanSeeder::class,
            UsersSeeder::class,
            ProgramKerjaSeeder::class,
            KategoriUtamaSeeder::class,
            KegiatanSeeder::class,
            RencanaAksiSeeder::class,
            TodoItemsSeeder::class,
            ProgramTemplateSeeder::class,
        ]);

        $this->command->info('Semua data seed berhasil ditambahkan!');
    }

}

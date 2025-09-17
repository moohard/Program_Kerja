<?php

// database/seeders/TodoItemsSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TodoItemsSeeder extends Seeder
{

    public function run()
    {

        $rencanaAksi = DB::table('rencana_aksi')->get();
        $data        = [];
        $now         = now();

        foreach ($rencanaAksi as $aksi)
        {
            // Create 2-5 todo items for each action plan
            $numTodos = rand(2, 5);

            for ($i = 1; $i <= $numTodos; $i++)
            {
                $daysOffset = rand(1, 60);

                $data[] = [
                    'rencana_aksi_id' => $aksi->id,
                    'deskripsi'       => "Todo item $i untuk " . substr($aksi->deskripsi_aksi, 0, 50) . "...",
                    'completed'       => rand(0, 1),
                    'deadline'        => $now->copy()->addDays($daysOffset),
                    'created_at'      => $now,
                    'updated_at'      => $now,
                ];
            }

            // Insert in batches to avoid memory issues
            if (count($data) >= 100)
            {
                DB::table('todo_items')->insert($data);
                $data = [];
            }
        }

        // Insert remaining items
        if (count($data) > 0)
        {
            DB::table('todo_items')->insert($data);
        }

        $this->command->info('Data todo items berhasil ditambahkan!');
    }

}

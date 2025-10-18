<?php

namespace Database\Factories;

use App\Models\RencanaAksi;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TodoItem>
 */
class TodoItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'rencana_aksi_id' => RencanaAksi::factory(),
            'deskripsi' => $this->faker->sentence(),
            'completed' => false,
        ];
    }
}

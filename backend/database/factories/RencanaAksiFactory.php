<?php

namespace Database\Factories;

use App\Models\Kegiatan;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\RencanaAksi>
 */
class RencanaAksiFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'kegiatan_id' => Kegiatan::factory(),
            'deskripsi_aksi' => $this->faker->sentence(),
            'status' => 'planned',
            'target_tanggal' => $this->faker->dateTimeBetween('+1 week', '+1 month'),
            'assigned_to' => User::factory(),
            'priority' => 'medium',
        ];
    }
}

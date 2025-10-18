<?php

namespace Database\Factories;

use App\Models\ProgramKerja;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\KategoriUtama>
 */
class KategoriUtamaFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'program_kerja_id' => ProgramKerja::factory(),
            'nomor' => $this->faker->unique()->numberBetween(1, 100),
            'nama_kategori' => $this->faker->sentence(3),
            'is_active' => true,
        ];
    }
}

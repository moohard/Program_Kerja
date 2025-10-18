<?php

namespace Database\Factories;

use App\Models\KategoriUtama;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Kegiatan>
 */
class KegiatanFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'kategori_id' => KategoriUtama::factory(),
            'nama_kegiatan' => $this->faker->sentence(),
            'is_active' => true,
        ];
    }
}

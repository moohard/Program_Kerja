<?php

namespace Database\Factories;

use App\Models\RencanaAksi;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ProgressMonitoring>
 */
class ProgressMonitoringFactory extends Factory
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
            'progress_percentage' => $this->faker->numberBetween(0, 100),
            'keterangan' => $this->faker->sentence(),
            'tanggal_monitoring' => $this->faker->date(),
        ];
    }
}

<?php

namespace Tests\Feature\Feature;

use App\Models\ProgressMonitoring;
use App\Models\RencanaAksi;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProgressMonitoringControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_get_list_of_progress_for_a_rencana_aksi(): void
    {
        $user = User::factory()->create();
        $rencanaAksi = RencanaAksi::factory()->create();
        ProgressMonitoring::factory()->count(3)->create(['rencana_aksi_id' => $rencanaAksi->id]);
        // Create an extra one for another Rencana Aksi to ensure filtering works
        ProgressMonitoring::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
                         ->getJson("/api/rencana-aksi/{$rencanaAksi->id}/progress");

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data')
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'progress_percentage',
                        'keterangan',
                        'tanggal_monitoring',
                    ]
                ]
            ]);
    }
}

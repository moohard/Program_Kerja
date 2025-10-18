<?php

namespace Tests\Feature;

use App\Models\RencanaAksi;
use App\Models\Kegiatan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RencanaAksiControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_get_list_of_rencana_aksi(): void
    {
        $user = User::factory()->create();
        $kegiatan = Kegiatan::factory()->create();
        RencanaAksi::factory()->count(3)->create(['kegiatan_id' => $kegiatan->id]);
        // Create an extra one for another kegiatan to ensure filtering works
        RencanaAksi::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
                         ->getJson("/api/rencana-aksi?kegiatan_id={$kegiatan->id}");

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data')
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'deskripsi_aksi',
                        'status',
                    ]
                ]
            ]);
    }

    public function test_can_create_a_new_rencana_aksi(): void
    {
        $user = User::factory()->create();
        $kegiatan = Kegiatan::factory()->create();

        $rencanaAksiData = [
            'kegiatan_id' => $kegiatan->id,
            'deskripsi_aksi' => 'Rencana Aksi Test Baru',
            'assigned_to' => $user->id,
            'priority' => 'medium',
            'jadwal_tipe' => 'insidentil',
            'jadwal_config' => ['months' => [1,2,3]], // Example config
        ];

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/rencana-aksi', $rencanaAksiData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'deskripsi_aksi',
                    'status',
                ]
            ])
            ->assertJsonFragment([
                'deskripsi_aksi' => 'Rencana Aksi Test Baru'
            ]);

        $this->assertDatabaseHas('rencana_aksi', [
            'kegiatan_id' => $kegiatan->id,
            'deskripsi_aksi' => 'Rencana Aksi Test Baru',
        ]);
    }
}

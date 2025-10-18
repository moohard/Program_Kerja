<?php

namespace Tests\Feature;

use App\Models\Kegiatan;
use App\Models\KategoriUtama;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class KegiatanControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_get_list_of_kegiatan(): void
    {
        $user = User::factory()->create();
        $kategori = KategoriUtama::factory()->create();
        Kegiatan::factory()->count(3)->create(['kategori_id' => $kategori->id]);
        // Create an extra one for another category to ensure filtering works
        Kegiatan::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
                         ->getJson("/api/kegiatan?kategori_id={$kategori->id}");

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data')
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'nama_kegiatan',
                        'is_active',
                    ]
                ]
            ]);
    }

    public function test_can_create_a_new_kegiatan(): void
    {
        $user = User::factory()->create();
        $kategori = KategoriUtama::factory()->create();

        $kegiatanData = [
            'kategori_id' => $kategori->id,
            'nama_kegiatan' => 'Kegiatan Test Baru',
        ];

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/kegiatan', $kegiatanData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'nama_kegiatan',
                    'is_active',
                ]
            ])
            ->assertJsonFragment([
                'nama_kegiatan' => 'Kegiatan Test Baru'
            ]);

        $this->assertDatabaseHas('kegiatan', $kegiatanData);
    }
}

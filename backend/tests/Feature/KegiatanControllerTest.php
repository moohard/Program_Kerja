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

    public function test_cannot_create_kegiatan_without_kategori_id(): void
    {
        $user = User::factory()->create();
        $kegiatanData = [
            'nama_kegiatan' => 'Kegiatan tanpa kategori',
        ];

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/kegiatan', $kegiatanData);

        $response->assertStatus(422)->assertJsonValidationErrors('kategori_id');
    }

    public function test_can_get_a_single_kegiatan(): void
    {
        $user = User::factory()->create();
        $kegiatan = Kegiatan::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->getJson("/api/kegiatan/{$kegiatan->id}");

        $response->assertStatus(200)
            ->assertJson(['data' => ['id' => $kegiatan->id]]);
    }

    public function test_can_update_a_kegiatan(): void
    {
        $user = User::factory()->create();
        $kegiatan = Kegiatan::factory()->create();
        $updateData = ['nama_kegiatan' => 'Nama Kegiatan Diperbarui'];

        $response = $this->actingAs($user, 'sanctum')->putJson("/api/kegiatan/{$kegiatan->id}", $updateData);

        $response->assertStatus(200)->assertJsonFragment($updateData);
        $this->assertDatabaseHas('kegiatan', $updateData);
    }

    public function test_can_delete_a_kegiatan(): void
    {
        $user = User::factory()->create();
        $kegiatan = Kegiatan::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->deleteJson("/api/kegiatan/{$kegiatan->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('kegiatan', ['id' => $kegiatan->id]);
    }
}

<?php

namespace Tests\Feature;

use App\Models\KategoriUtama;
use App\Models\ProgramKerja;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class KategoriUtamaControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_get_list_of_kategori_utama(): void
    {
        $user = User::factory()->create();
        $programKerja = ProgramKerja::factory()->create();
        KategoriUtama::factory()->count(3)->create([
            'program_kerja_id' => $programKerja->id,
        ]);
        // Create an extra one for another program to ensure filtering works
        KategoriUtama::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
                         ->getJson("/api/kategori-utama?program_kerja_id={$programKerja->id}");

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data')
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'nomor',
                        'nama_kategori',
                        'is_active',
                    ]
                ]
            ]);
    }

    public function test_can_create_a_new_kategori_utama(): void
    {
        $user = User::factory()->create();
        $programKerja = ProgramKerja::factory()->create();

        $kategoriData = [
            'program_kerja_id' => $programKerja->id,
            'nomor' => 1,
            'nama_kategori' => 'Kategori Test Baru',
        ];

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/kategori-utama', $kategoriData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'nomor',
                    'nama_kategori',
                    'is_active',
                ]
            ])
            ->assertJsonFragment([
                'nama_kategori' => 'Kategori Test Baru'
            ]);

        $this->assertDatabaseHas('kategori_utama', $kategoriData);
    }
}

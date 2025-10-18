<?php

namespace Tests\Feature;

use App\Models\ProgramKerja;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProgramKerjaControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_get_list_of_program_kerja(): void
    {
        $user = User::factory()->create();
        ProgramKerja::factory()->count(3)->create();

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/program-kerja');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data')
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'tahun',
                        'nama_pengadilan',
                        'is_aktif',
                    ]
                ]
            ]);
    }

    public function test_can_create_a_new_program_kerja(): void
    {
        $user = User::factory()->create();
        $programKerjaData = [
            'tahun' => '2025',
            'is_aktif' => true,
        ];

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/program-kerja', $programKerjaData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'tahun',
                    'nama_pengadilan',
                    'is_aktif',
                ]
            ])
            ->assertJsonFragment($programKerjaData);

        $this->assertDatabaseHas('program_kerja', $programKerjaData);
    }
}

<?php

namespace Tests\Feature\Feature;

use App\Models\ProgramKerja;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class ReportControllerTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test the annual-summary endpoint returns a correct structure.
     */
    public function test_annual_summary_endpoint_returns_correct_structure(): void
    {
        $user = User::factory()->create();
        $programKerja = ProgramKerja::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
                         ->getJson("/api/reports/annual-summary?program_kerja_id={$programKerja->id}");

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'summary',
                     'progress_by_category',
                     'highlights',
                 ]);
    }
}

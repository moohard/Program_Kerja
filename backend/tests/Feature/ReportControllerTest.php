<?php

namespace Tests\Feature;

use App\Models\ProgramKerja;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
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

    /**
     * Test the export-annual-summary endpoint generates a PDF.
     */
    public function test_export_annual_summary_endpoint_generates_pdf(): void
    {
        Storage::fake('s3');

        $user = User::factory()->create();
        $programKerja = ProgramKerja::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
                         ->postJson("/api/reports/export-annual-summary", [
                             'program_kerja_id' => $programKerja->id,
                             'format' => 'pdf',
                         ]);

        $response->assertStatus(200)
                 ->assertJsonStructure(['download_url']);

        // Ambil semua file di storage fake
        $files = Storage::disk('s3')->files('generated-reports');
        $this->assertCount(1, $files, "A file should have been generated.");

        // Verifikasi bahwa file yang benar telah di-put
        Storage::disk('s3')->assertExists($files[0]);
    }
}

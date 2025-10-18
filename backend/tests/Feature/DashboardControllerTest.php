<?php

namespace Tests\Feature\Feature;

use App\Models\ProgramKerja;
use App\Models\RencanaAksi;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_stats_are_correct(): void
    {
        $user = User::factory()->create();
        $programKerja = ProgramKerja::factory()->create(['is_aktif' => true]);

        // Create RencanaAksi with various statuses
        $kegiatan = \App\Models\Kegiatan::factory()->create(['kategori_id' => \App\Models\KategoriUtama::factory()->create(['program_kerja_id' => $programKerja->id])]);

        RencanaAksi::factory()->count(2)->create(['kegiatan_id' => $kegiatan->id, 'status' => 'completed']);
        RencanaAksi::factory()->count(3)->create(['kegiatan_id' => $kegiatan->id, 'status' => 'in_progress']);
        RencanaAksi::factory()->count(4)->create(['kegiatan_id' => $kegiatan->id, 'status' => 'planned']);
        // Overdue tasks
        RencanaAksi::factory()->count(2)->create([
            'kegiatan_id' => $kegiatan->id,
            'status' => 'in_progress',
            'target_tanggal' => now()->subWeek(),
        ]);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/dashboard-stats');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'summary',
                'overdue_tasks_count',
                'upcoming_deadlines',
                'recent_activities',
            ])
            ->assertJson([
                'summary' => [
                    'completed' => 2,
                    'in_progress' => 5, // 3 + 2 overdue
                    'planned' => 4,
                ],
                'overdue_tasks_count' => 2,
            ]);
    }
}

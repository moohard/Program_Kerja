<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProgramKerja;
use App\Models\RencanaAksi;
use App\Models\KategoriUtama;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $programKerjaAktif = ProgramKerja::where('is_aktif', true)->first();
        if (!$programKerjaAktif) {
            return response()->json([
                'summary' => ['total' => 0, 'completed' => 0, 'in_progress' => 0, 'delayed' => 0],
                'progress_by_category' => [],
                'upcoming_deadlines' => [],
            ]);
        }

        $summary = $this->getSummaryStats($programKerjaAktif->id);
        $progressByCategory = $this->getProgressByCategory($programKerjaAktif->id);
        $upcomingDeadlines = $this->getUpcomingDeadlines($programKerjaAktif->id);
        $recentActivity = $this->getRecentActivity();

        return response()->json([
            'summary' => $summary,
            'progress_by_category' => $progressByCategory,
            'upcoming_deadlines' => $upcomingDeadlines,
            'recent_activity' => $recentActivity,
        ]);
    }

    private function getSummaryStats($programKerjaId)
    {
        return RencanaAksi::whereHas('kegiatan.kategoriUtama', function ($query) use ($programKerjaId) {
            $query->where('program_kerja_id', $programKerjaId);
        })->select('status', DB::raw('count(*) as total'))
          ->groupBy('status')
          ->get()
          ->pluck('total', 'status')
          ->toArray();
    }

    private function getProgressByCategory($programKerjaId)
    {
        $categories = KategoriUtama::where('program_kerja_id', $programKerjaId)
            ->where('is_active', true)
            ->with(['kegiatan.rencanaAksi.latestProgress'])
            ->orderBy('nomor')
            ->get();

        return $categories->map(function ($kategori) {
            $allAksi = $kategori->kegiatan->flatMap(function($kg) {
                return $kg->rencanaAksi;
            });

            if ($allAksi->isEmpty()) {
                return [
                    'category_name' => $kategori->nama_kategori,
                    'average_progress' => 0,
                ];
            }

            $totalProgress = $allAksi->sum(function ($aksi) {
                return $aksi->latestProgress->progress_percentage ?? 0;
            });

            return [
                'category_name' => "{$kategori->nomor}. {$kategori->nama_kategori}",
                'average_progress' => round($totalProgress / $allAksi->count(), 2),
            ];
        });
    }

    private function getUpcomingDeadlines($programKerjaId)
    {
        return RencanaAksi::with('kegiatan:id,nama_kegiatan', 'assignedTo:id,name')
            ->whereHas('kegiatan.kategoriUtama', function ($query) use ($programKerjaId) {
                $query->where('program_kerja_id', $programKerjaId);
            })
            ->where('status', '!=', 'completed')
            ->where('target_tanggal', '>=', Carbon::today())
            ->where('target_tanggal', '<=', Carbon::today()->addDays(7))
            ->orderBy('target_tanggal', 'asc')
            ->limit(5)
            ->get(['id', 'deskripsi_aksi', 'target_tanggal', 'kegiatan_id', 'assigned_to']);
    }

    private function getRecentActivity()
    {
        $logs = AuditLog::with('user:id,name')->latest()->limit(10)->get();

        // Transform the logs to create a human-readable description
        return $logs->map(function ($log) {
            $userName = $log->user->name ?? 'Sistem';
            $action = strtolower($log->action);

            $verbMap = [
                'create' => 'membuat',
                'update' => 'memperbarui',
                'delete' => 'menghapus',
            ];
            $verb = $verbMap[$action] ?? $action;

            $objectType = str_replace('_', ' ', \Illuminate\Support\Str::singular($log->table_name));

            // Try to get a representative name from the new_values json
            $objectName = '';
            if (isset($log->new_values)) {
                $objectName = $log->new_values['deskripsi_aksi'] ?? $log->new_values['nama_kegiatan'] ?? $log->new_values['name'] ?? '';
            }

            $description = "<b>{$userName}</b> {$verb} {$objectType}";
            if ($objectName) {
                // Limit the length of the object name to avoid overly long descriptions
                $shortName = \Illuminate\Support\Str::limit($objectName, 50);
                $description .= " <i>'{$shortName}'</i>";
            }

            return [
                'id' => $log->id,
                'description' => $description,
                'created_at' => $log->created_at,
                'user' => $log->user,
            ];
        });
    }
}

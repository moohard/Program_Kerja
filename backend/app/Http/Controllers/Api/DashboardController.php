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
    public function index(Request $request)
    {
        // Validasi input filter
        $filters = $request->validate([
            'program_kerja_id' => 'nullable|integer|exists:program_kerja,id',
            'kategori_id' => 'nullable|integer|exists:kategori_utama,id',
            'user_id' => 'nullable|integer|exists:users,id',
            'status' => 'nullable|string|in:planned,in_progress,completed,delayed',
        ]);

        $programKerjaId = $filters['program_kerja_id'] ?? ProgramKerja::where('is_aktif', true)->first()->id ?? null;

        if (!$programKerjaId) {
            return response()->json([
                'summary' => ['total' => 0, 'completed' => 0, 'in_progress' => 0, 'delayed' => 0],
                'progress_by_category' => [],
                'upcoming_deadlines' => [],
                'recent_activity' => [],
            ]);
        }

        $summary = $this->getSummaryStats($programKerjaId, $filters);
        $progressByCategory = $this->getProgressByCategory($programKerjaId, $filters);
        $upcomingDeadlines = $this->getUpcomingDeadlines($programKerjaId, $filters);
        $recentActivities = $this->getRecentActivity(); // Recent activity tidak difilter
        $overdueTasksCount = $this->getOverdueTasksCount($programKerjaId, $filters);

        return response()->json([
            'summary' => $summary,
            'progress_by_category' => $progressByCategory,
            'upcoming_deadlines' => $upcomingDeadlines,
            'recent_activities' => $recentActivities,
            'overdue_tasks_count' => $overdueTasksCount,
        ]);
    }

    private function getOverdueTasksCount($programKerjaId, array $filters = [])
    {
        $query = RencanaAksi::whereHas('kegiatan.kategoriUtama', function ($query) use ($programKerjaId) {
            $query->where('program_kerja_id', $programKerjaId);
        });

        $query->when($filters['kategori_id'] ?? null, function ($q, $kategoriId) {
            $q->whereHas('kegiatan', fn($sq) => $sq->where('kategori_id', $kategoriId));
        })
        ->when($filters['user_id'] ?? null, function ($q, $userId) {
            $q->where('assigned_to', $userId);
        })
        ->when($filters['status'] ?? null, function ($q, $status) {
            $q->where('status', $status);
        });

        return $query->where('status', '!=', 'completed')
            ->whereDate('target_tanggal', '<', now())
            ->count();
    }

    private function getSummaryStats($programKerjaId, array $filters = [])
    {
        $query = RencanaAksi::whereHas('kegiatan.kategoriUtama', function ($query) use ($programKerjaId) {
            $query->where('program_kerja_id', $programKerjaId);
        });

        $query->when($filters['kategori_id'] ?? null, function ($q, $kategoriId) {
            $q->whereHas('kegiatan', fn($sq) => $sq->where('kategori_id', $kategoriId));
        })
        ->when($filters['user_id'] ?? null, function ($q, $userId) {
            $q->where('assigned_to', $userId);
        })
        ->when($filters['status'] ?? null, function ($q, $status) {
            $q->where('status', $status);
        });

        return $query->select('status', DB::raw('count(*) as total'))
          ->groupBy('status')
          ->get()
          ->pluck('total', 'status')
          ->toArray();
    }

    private function getProgressByCategory($programKerjaId, array $filters = [])
    {
        $kategoriQuery = KategoriUtama::where('program_kerja_id', $programKerjaId)
            ->where('is_active', true);

        // Filter by category if provided
        $kategoriQuery->when($filters['kategori_id'] ?? null, function ($q, $kategoriId) {
            $q->where('id', $kategoriId);
        });

        $categories = $kategoriQuery->with([
            'kegiatan.rencanaAksi' => function ($rencanaAksiQuery) use ($filters) {
                // Filter rencanaAksi by user and status
                $rencanaAksiQuery
                    ->when($filters['user_id'] ?? null, fn($q, $userId) => $q->where('assigned_to', $userId))
                    ->when($filters['status'] ?? null, fn($q, $status) => $q->where('status', $status));
            },
            // Eager load the relationship needed by the 'overall_progress_percentage' accessor
            'kegiatan.rencanaAksi.progressMonitorings'
        ])->orderBy('nomor')->get();

        return $categories->map(function ($kategori) {
            $allAksi = $kategori->kegiatan->flatMap(fn($kg) => $kg->rencanaAksi);

            if ($allAksi->isEmpty()) {
                return null; // Will be filtered out later
            }

            // [UPDATE] Use the accurate 'overall_progress_percentage' accessor
            $totalProgress = $allAksi->sum(fn($aksi) => $aksi->overall_progress_percentage);
            $averageProgress = $allAksi->count() > 0 ? round($totalProgress / $allAksi->count(), 2) : 0;

            return [
                'category_name' => "{$kategori->nomor}. {$kategori->nama_kategori}",
                'average_progress' => $averageProgress,
            ];
        })->filter()->values(); // Remove nulls and re-index
    }

    private function getUpcomingDeadlines($programKerjaId, array $filters = [])
    {
        $query = RencanaAksi::with('kegiatan:id,nama_kegiatan', 'assignedTo:id,name')
            ->whereHas('kegiatan.kategoriUtama', function ($query) use ($programKerjaId) {
                $query->where('program_kerja_id', $programKerjaId);
            });

        $query->when($filters['kategori_id'] ?? null, function ($q, $kategoriId) {
            $q->whereHas('kegiatan', fn($sq) => $sq->where('kategori_id', $kategoriId));
        })
        ->when($filters['user_id'] ?? null, function ($q, $userId) {
            $q->where('assigned_to', $userId);
        })
        ->when($filters['status'] ?? null, function ($q, $status) {
            $q->where('status', $status);
        }, function ($q) {
            // Default behavior if status filter is not applied
            $q->where('status', '!=', 'completed');
        });

        return $query->where('target_tanggal', '>=', Carbon::today())
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

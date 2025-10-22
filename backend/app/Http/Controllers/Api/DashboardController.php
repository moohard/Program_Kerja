<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProgramKerja;
use App\Models\RencanaAksi;
use App\Models\KategoriUtama;
use App\Models\Kegiatan;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->validate([
            'program_kerja_id' => 'nullable|integer|exists:program_kerja,id',
            'kategori_id' => 'nullable|integer|exists:kategori_utama,id',
            'kegiatan_id' => 'nullable|integer|exists:kegiatan,id',
            'user_id' => 'nullable|integer|exists:users,id',
            'status' => 'nullable|string|in:planned,in_progress,completed,delayed',
            'display_type' => 'sometimes|string|in:kategori,kegiatan,rencana_aksi',
        ]);

        $programKerjaId = $filters['program_kerja_id'] ?? ProgramKerja::where('is_aktif', true)->first()->id ?? null;

        if (!$programKerjaId) {
            return response()->json([
                'summary' => ['total' => 0, 'completed' => 0, 'in_progress' => 0, 'delayed' => 0],
                'progress_chart_data' => [],
                'upcoming_deadlines' => [],
                'recent_activities' => [],
                'overdue_tasks_count' => 0,
            ]);
        }

        $displayType = $filters['display_type'] ?? 'kategori';
        
        $progressChartData = match ($displayType) {
            'kegiatan' => $this->getProgressByKegiatan($programKerjaId, $filters),
            'rencana_aksi' => $this->getProgressByRencanaAksi($programKerjaId, $filters),
            default => $this->getProgressByCategory($programKerjaId, $filters),
        };

        $summary = $this->getSummaryStats($programKerjaId, $filters);
        $upcomingDeadlines = $this->getUpcomingDeadlines($programKerjaId, $filters);
        $recentActivities = $this->getRecentActivity();
        $overdueTasksCount = $this->getOverdueTasksCount($programKerjaId, $filters);

        return response()->json([
            'summary' => $summary,
            'progress_chart_data' => $progressChartData,
            'upcoming_deadlines' => $upcomingDeadlines,
            'recent_activities' => $recentActivities,
            'overdue_tasks_count' => $overdueTasksCount,
        ]);
    }

    private function applyCommonFilters($query, array $filters)
    {
        // This is the base query for RencanaAksi
        $baseQuery = $query->whereHas('kegiatan.kategoriUtama', fn($q) => $q->where('program_kerja_id', $filters['program_kerja_id']));

        $baseQuery->when($filters['kategori_id'] ?? null, function ($q, $id) {
            $q->whereHas('kegiatan', fn($sq) => $sq->where('kategori_id', $id));
        });

        $baseQuery->when($filters['kegiatan_id'] ?? null, function ($q, $id) {
            $q->where('kegiatan_id', $id);
        });

        $baseQuery->when($filters['user_id'] ?? null, function ($q, $id) {
            $q->where('assigned_to', $id);
        });

        $baseQuery->when($filters['status'] ?? null, function ($q, $status) {
            $q->where('status', $status);
        });
    }

    private function getSummaryStats($programKerjaId, array $filters = [])
    {
        $query = RencanaAksi::query();
        $this->applyCommonFilters($query, array_merge($filters, ['program_kerja_id' => $programKerjaId]));
        return $query->select('status', DB::raw('count(*) as total'))->groupBy('status')->get()->pluck('total', 'status')->toArray();
    }

    private function getOverdueTasksCount($programKerjaId, array $filters = [])
    {
        $query = RencanaAksi::query();
        $this->applyCommonFilters($query, array_merge($filters, ['program_kerja_id' => $programKerjaId]));
        return $query->where('status', '!=', 'completed')->whereDate('target_tanggal', '<', now())->count();
    }

    private function getProgressByCategory($programKerjaId, array $filters = [])
    {
        $query = KategoriUtama::where('program_kerja_id', $programKerjaId)->where('is_active', true);
        $query->when($filters['kategori_id'] ?? null, fn($q, $id) => $q->where('id', $id));

        $categories = $query->with([
            'kegiatan' => function ($q) use ($filters) {
                $q->when($filters['kegiatan_id'] ?? null, fn($sq, $id) => $sq->where('id', $id));
            },
            'kegiatan.rencanaAksi' => function ($q) use ($filters) {
                // We only need to apply user/status filters here as others are contextually applied
                $q->when($filters['user_id'] ?? null, fn($sq, $id) => $sq->where('assigned_to', $id));
                $q->when($filters['status'] ?? null, fn($sq, $status) => $sq->where('status', $status));
            },
            'kegiatan.rencanaAksi.progressMonitorings'
        ])->orderBy('nomor')->get();

        return $categories->map(function ($kategori) {
            $allAksi = $kategori->kegiatan->flatMap(fn($kg) => $kg->rencanaAksi);
            if ($allAksi->isEmpty()) return null;
            $average = $allAksi->avg('overall_progress_percentage');
            return ['name' => "{$kategori->nomor}. {$kategori->nama_kategori}", 'progress' => round($average, 2)];
        })->filter()->values();
    }

    private function getProgressByKegiatan($programKerjaId, array $filters = [])
    {
        $query = Kegiatan::whereHas('kategoriUtama', fn($q) => $q->where('program_kerja_id', $programKerjaId));
        
        $query->when($filters['kategori_id'] ?? null, fn($q, $id) => $q->where('kategori_id', $id));
        $query->when($filters['kegiatan_id'] ?? null, fn($q, $id) => $q->where('id', $id));

        $kegiatan = $query->with([
            'rencanaAksi' => function ($q) use ($filters) {
                $q->when($filters['user_id'] ?? null, fn($sq, $id) => $sq->where('assigned_to', $id));
                $q->when($filters['status'] ?? null, fn($sq, $status) => $sq->where('status', $status));
            },
            'rencanaAksi.progressMonitorings'
        ])->get();

        return $kegiatan->map(function ($item) {
            if ($item->rencanaAksi->isEmpty()) return null;
            $average = $item->rencanaAksi->avg('overall_progress_percentage');
            return ['name' => $item->nama_kegiatan, 'progress' => round($average, 2)];
        })->filter()->values();
    }

    private function getProgressByRencanaAksi($programKerjaId, array $filters = [])
    {
        $query = RencanaAksi::query();
        $this->applyCommonFilters($query, array_merge($filters, ['program_kerja_id' => $programKerjaId]));
        
        $aksi = $query->with('progressMonitorings')->get();

        return $aksi->map(function ($item) {
            return ['name' => \Illuminate\Support\Str::limit($item->deskripsi_aksi, 50), 'progress' => $item->overall_progress_percentage];
        });
    }

    private function getUpcomingDeadlines($programKerjaId, array $filters = [])
    {
        $query = RencanaAksi::query();
        $this->applyCommonFilters($query, array_merge($filters, ['program_kerja_id' => $programKerjaId]));

        return $query->with('kegiatan:id,nama_kegiatan', 'assignedTo:id,name')
            ->where('status', '!=', 'completed')
            ->where('target_tanggal', '>=', Carbon::today())
            ->where('target_tanggal', '<=', Carbon::today()->addDays(7))
            ->orderBy('target_tanggal', 'asc')
            ->limit(5)
            ->get(['id', 'deskripsi_aksi', 'target_tanggal', 'kegiatan_id', 'assigned_to']);
    }

    private function getRecentActivity()
    {
        return AuditLog::with('user:id,name')->latest()->limit(10)->get()->map(function ($log) {
            $userName = $log->user->name ?? 'Sistem';
            $action = strtolower($log->action);
            $verbMap = ['create' => 'membuat', 'update' => 'memperbarui', 'delete' => 'menghapus'];
            $verb = $verbMap[$action] ?? $action;
            $objectType = str_replace('_', ' ', \Illuminate\Support\Str::singular($log->table_name));
            $objectName = $log->new_values['deskripsi_aksi'] ?? $log->new_values['nama_kegiatan'] ?? $log->new_values['name'] ?? '';
            $description = "<b>{$userName}</b> {$verb} {$objectType}";
            if ($objectName) {
                $description .= " <i>'" . \Illuminate\Support\Str::limit($objectName, 50) . "'</i>";
            }
            return ['id' => $log->id, 'description' => $description, 'created_at' => $log->created_at, 'user' => $log->user];
        });
    }
}
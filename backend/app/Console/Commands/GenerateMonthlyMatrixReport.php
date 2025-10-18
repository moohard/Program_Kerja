<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\RencanaAksi;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Carbon\Carbon;

class GenerateMonthlyMatrixReport extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'reports:generate-matrix';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate the monthly matrix report for the previous month and save it to storage.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Generating monthly matrix report for previous month...');

        $targetDate = Carbon::now()->subMonth();
        $year = $targetDate->year;
        $month = $targetDate->month;

        // 1. Ambil data mentah (mengadaptasi dari ReportController)
        $rencanaAksis = RencanaAksi::whereYear('target_tanggal', $year)
            ->with(['kegiatan.kategoriUtama', 'assignedTo:id,name', 'progressMonitorings' => function($q) use ($year, $month) {
                $q->whereYear('report_date', $year)->whereMonth('report_date', $month);
            }])
            ->whereHas('kegiatan.kategoriUtama.programKerja', fn($q) => $q->where('tahun', $year))
            ->orderBy('kegiatan_id')
            ->get();

        if ($rencanaAksis->isEmpty()) {
            $this->warn("No data found for {$targetDate->format('F Y')}. Report not generated.");
            return 0;
        }

        // 2. Proses dan kelompokkan data untuk view PDF
        $groupedData = $rencanaAksis->groupBy(function($item) {
            return optional($item->kegiatan->kategoriUtama)->nama_kategori ?? 'Uncategorized';
        })->map(function($kategoriGroup) {
            return $kategoriGroup->groupBy('kegiatan.nama_kegiatan')
                ->map(function($kegiatanGroup) {
                    return [
                        'nama_kegiatan' => $kegiatanGroup->first()->kegiatan->nama_kegiatan,
                        'rencana_aksi' => $kegiatanGroup->map(function($aksi) {
                            $monthlyProgress = $aksi->progressMonitorings->mapWithKeys(function ($progress) {
                                return [(int)date('m', strtotime($progress->report_date)) => $progress->progress_percentage];
                            });
                            return [
                                'deskripsi_aksi' => $aksi->deskripsi_aksi,
                                'assigned_to' => $aksi->assignedTo,
                                'target_tanggal' => $aksi->target_tanggal,
                                'monthly_progress' => $monthlyProgress,
                            ];
                        })->values()->all(),
                    ];
                })->values()->all();
        });

        // 3. Buat PDF
        $pdf = Pdf::loadView('reports.matriks_pdf', ['data' => $groupedData, 'year' => $year])
            ->setPaper('a3', 'landscape');

        // 4. Simpan ke S3 secara permanen
        $monthStr = Str::padLeft($month, 2, '0');
        $fileName = "reports/matriks/Laporan-Matriks-{$year}-{$monthStr}.pdf";
        
        Storage::disk('s3')->put($fileName, $pdf->output());

        $this->info("Successfully generated and saved report to: {$fileName}");
        return 0;
    }
}

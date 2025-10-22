<?php

namespace App\Exports;

use App\Models\RencanaAksi;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Illuminate\Support\Carbon;

class LaporanMatriksExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{

    protected $data;
    protected $jadwalService;

    public function __construct($data, \App\Services\JadwalService $jadwalService)
    {
        // NOTE: Pastikan data yang di-pass ke sini sudah eager load relasi
        // yang dibutuhkan untuk menghindari N+1 query problem.
        // Contoh: RencanaAksi::with('kegiatan.kategoriUtama', 'assignedTo', 'progressMonitorings.attachments')->get();
        $this->data = $data;
        $this->jadwalService = $jadwalService;
    }

    /**
     * @return \Illuminate\Support\Collection
     */
    public function collection()
    {
        return $this->data;
    }

    /**
     * @return array
     */
    public function headings(): array
    {
        return [
            'Kegiatan Utama',
            'Kegiatan',
            'Rencana Aksi Kegiatan',
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'Mei',
            'Jun',
            'Jul',
            'Ags',
            'Sep',
            'Okt',
            'Nov',
            'Des',
            'Target (%)',
            'Output',
            'Penanggung Jawab',
        ];
    }

    /**
     * @param RencanaAksi $row
     *
     * @return array
     */
    public function map($row): array
    {
        // Group progress by month for easy lookup
        $progressByMonth = [];
        foreach ($row->progressMonitorings as $progress) {
            $month = Carbon::parse($progress->report_date)->month;
            $progressByMonth[$month] = $progress;
        }

        // Determine status for each month
        $schedule = array_fill(1, 12, '');
        if (!empty($row->jadwal_config) && is_array($row->jadwal_config)) {
            // Menggunakan JadwalService untuk mendapatkan bulan yang direncanakan secara akurat
            $plannedMonths = $this->jadwalService->getTargetMonths($row->jadwal_tipe, $row->jadwal_config);

            foreach ($plannedMonths as $month) {
                if ($month >= 1 && $month <= 12) {
                    if (isset($progressByMonth[$month])) {
                        $progress = $progressByMonth[$month];
                        if ($progress->progress_percentage == 100) {
                            $schedule[$month] = $progress->is_late ? 'completed (late)' : 'completed';
                        } elseif ($progress->progress_percentage > 0) {
                            $schedule[$month] = 'progress';
                        } else {
                            // Jika ada progress report tapi 0%, anggap 'progress' bukan 'planned'
                            $schedule[$month] = 'progress';
                        }
                    } else {
                        $schedule[$month] = 'planned';
                    }
                }
            }
        }

        // Collect all attachment filenames
        $attachmentsList = [];
        foreach ($row->progressMonitorings as $progress) {
            if ($progress->attachments) {
                foreach ($progress->attachments as $attachment) {
                    // Asumsi nama file disimpan di kolom 'file_name' atau 'original_name'
                    $attachmentsList[] = $attachment->file_name ?? $attachment->original_name ?? 'unknown_file';
                }
            }
        }
        $output = count($attachmentsList) > 0 ? implode("\n", $attachmentsList) : '-';

        return [
            $row->kegiatan->kategoriUtama->nama_kategori ?? '-',
            $row->kegiatan->nama_kegiatan ?? '-',
            $row->deskripsi_aksi,
            $schedule[1],
            $schedule[2],
            $schedule[3],
            $schedule[4],
            $schedule[5],
            $schedule[6],
            $schedule[7],
            $schedule[8],
            $schedule[9],
            $schedule[10],
            $schedule[11],
            $schedule[12],
            '100', // Target
            $output,
            $row->assignedTo->name ?? '-',
        ];
    }

    /**
     * @param Worksheet $sheet
     *
     * @return array
     */
    public function styles(Worksheet $sheet)
    {
        return [
            // Style the first row as bold.
            1 => ['font' => ['bold' => true]],
        ];
    }
}

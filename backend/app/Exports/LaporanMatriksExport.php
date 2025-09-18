<?php

namespace App\Exports;

use App\Models\RencanaAksi;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class LaporanMatriksExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{

    protected $data;

    public function __construct($data)
    {

        $this->data = $data;
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
            'Terlaksana / Belum Terlaksana',
        ];
    }

    /**
     * @param mixed $row
     *
     * @return array
     */
    public function map($row): array
    {

        $schedule = array_fill(1, 12, '');
        \Log::info('Row data:', [ 'row' => $row, 'jadwal_config' => $row->jadwal_config ?? NULL ]);
        // Pastikan jadwal_config ada dan berupa array
        if (!empty($row->jadwal_config) && is_array($row->jadwal_config))
        {
            $months = $row->jadwal_config['months'] ?? [];
            foreach ($months as $month)
            {
                if ($month >= 1 && $month <= 12)
                {
                    $schedule[$month] = $row->status;
                }
            }
        }

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
            '100',
            $row->catatan ?? '-',
            $row->assignedTo->name ?? '-',
            $row->status === 'completed' ? 'Terlaksana' : 'Belum Terlaksana',
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
            // Style baris heading
            1 => [ 'font' => [ 'bold' => TRUE ] ],
        ];
    }

}

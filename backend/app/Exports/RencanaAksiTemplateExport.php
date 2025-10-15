<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class RencanaAksiTemplateExport implements FromCollection, WithHeadings
{
    public function collection()
    {
        return collect([]); // Return koleksi kosong karena ini hanya template
    }

    public function headings(): array
    {
        return [
            'nama_rencana_aksi',
            'deskripsi',
            'user_id',
            'bulan_pelaksanaan_angka',
        ];
    }
}
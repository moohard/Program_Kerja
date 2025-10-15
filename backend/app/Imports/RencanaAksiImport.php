<?php

namespace App\Imports;

use App\Models\RencanaAksi;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class RencanaAksiImport implements ToModel, WithHeadingRow, WithValidation
{
    private $kegiatanId;

    public function __construct(int $kegiatanId)
    {
        $this->kegiatanId = $kegiatanId;
    }

    /**
    * @param array $row
    *
    * @return \Illuminate\Database\Eloquent\Model|null
    */
    public function model(array $row)
    {
        return new RencanaAksi([
            'kegiatan_id' => $this->kegiatanId,
            'nama_rencana_aksi' => $row['nama_rencana_aksi'],
            'deskripsi' => $row['deskripsi'],
            'user_id' => $row['user_id'],
            'status' => 'planned', // Default status
            'jadwal_config' => json_encode(['type' => 'monthly', 'months' => explode(',', $row['bulan_pelaksanaan_angka'])]),
        ]);
    }

    public function rules(): array
    {
        return [
            'nama_rencana_aksi' => 'required|string|max:255',
            'user_id' => 'required|integer|exists:users,id',
            'bulan_pelaksanaan_angka' => 'required|string', // e.g., "1,2,3"
        ];
    }
}
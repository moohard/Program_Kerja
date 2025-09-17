<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRencanaAksiRequest extends FormRequest
{

    public function authorize(): bool
    {

        return TRUE;
    }

    public function rules(): array
    {

        return [
            'kegiatan_id'    => 'required|integer|exists:kegiatan,id',
            'nomor_aksi'     => 'nullable|string|max:10',
            'deskripsi_aksi' => 'required|string',
            'target_tanggal' => 'nullable|date',
            'catatan'        => 'nullable|string',
            'assigned_to'    => 'nullable|integer|exists:users,id',
            'jadwal_tipe'    => [ 'required', Rule::in([ 'insidentil', 'periodik', 'rutin' ]) ],
            'jadwal_config'  => 'nullable|json',
            'priority'       => [ 'required', Rule::in([ 'low', 'medium', 'high' ]) ],
        ];
    }

}

<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRencanaAksiRequest extends FormRequest
{

    public function authorize(): bool
    {

        return TRUE;
    }

    public function rules(): array
    {

        return [
            'kegiatan_id'    => 'sometimes|required|integer|exists:kegiatan,id',
            'nomor_aksi'     => 'sometimes|nullable|string|max:10',
            'deskripsi_aksi' => 'sometimes|required|string',
            'target_tanggal' => 'sometimes|nullable|date',
            'catatan'        => 'sometimes|nullable|string',
            'assigned_to'    => 'sometimes|nullable|integer|exists:users,id',
            'jadwal_tipe'    => [ 'sometimes', 'required', Rule::in([ 'insidentil', 'periodik', 'rutin' ]) ],
            'jadwal_config'  => 'sometimes|nullable|json',
            'priority'       => [ 'sometimes', 'required', Rule::in([ 'low', 'medium', 'high' ]) ],
        ];
    }

}

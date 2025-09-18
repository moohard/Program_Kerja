<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRencanaAksiRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }
    public function rules(): array
    {
        return [
            'kegiatan_id' => 'required|exists:kegiatan,id',
            'deskripsi_aksi' => 'required|string',
            'assigned_to' => 'nullable|exists:users,id',
            'priority' => 'required|in:low,medium,high',
            'catatan' => 'nullable|string',
            'schedule_months' => 'required|array|min:1',
            'schedule_months.*' => 'integer|min:1|max:12',
            'year' => 'required|integer|min:2020|max:2099',
        ];
    }
}
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRencanaAksiRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
         return [
            'kegiatan_id' => 'sometimes|required|exists:kegiatan,id',
            'deskripsi_aksi' => 'sometimes|required|string',
            'assigned_to' => 'nullable|exists:users,id',
            'priority' => 'sometimes|required|in:low,medium,high',
            'catatan' => 'nullable|string',
            'schedule_months' => 'sometimes|required|array|min:1',
            'schedule_months.*' => 'integer|min:1|max:12',
            'year' => 'sometimes|required|integer|min:2020|max:2099',
        ];
    }
}
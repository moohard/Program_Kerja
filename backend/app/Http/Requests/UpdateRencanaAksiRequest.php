<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRencanaAksiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'deskripsi_aksi' => 'sometimes|required|string',
            'assigned_to' => 'sometimes|nullable|exists:users,id',
            'priority' => 'sometimes|required|in:low,medium,high',
            'catatan' => 'sometimes|nullable|string',
            'jadwal_tipe' => ['sometimes', 'required', Rule::in(['insidentil', 'periodik', 'rutin', 'bulanan'])],
            'jadwal_config' => 'sometimes|nullable|array',
            'jadwal_config.periode' => ['sometimes', 'required_if:jadwal_tipe,periodik', 'string', Rule::in(['triwulanan', 'semesteran'])],
            'jadwal_config.months' => ['sometimes', 'nullable', 'array'],
            'jadwal_config.months.*' => 'sometimes|integer|min:1|max:12',
        ];
    }
}
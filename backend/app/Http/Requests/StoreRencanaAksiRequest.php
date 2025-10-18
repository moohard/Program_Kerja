<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRencanaAksiRequest extends FormRequest
{
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
            'jadwal_tipe' => ['required', Rule::in(['insidentil', 'periodik', 'rutin', 'bulanan'])],
            'jadwal_config' => 'required|array',
            'jadwal_config.months' => 'required_if:jadwal_tipe,insidentil,bulanan|array|min:1',
            'jadwal_config.months.*' => 'integer|min:1|max:12',
            'jadwal_config.periode' => ['required_if:jadwal_tipe,periodik', Rule::in(['triwulanan', 'semesteran'])],
            'jadwal_config.hari' => 'required_if:jadwal_tipe,rutin|array|min:1',
            'jadwal_config.hari.*' => 'integer|min:0|max:6',
        ];
    }

    protected function prepareForValidation()
    {
        if (!$this->has('target_tanggal')) {
            $this->merge(['target_tanggal' => now()->toDateString()]);
        }
    }
}
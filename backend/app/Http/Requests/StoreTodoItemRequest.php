<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreTodoItemRequest extends FormRequest
{

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'deskripsi'           => 'required|string|max:255',
            'deadline'            => 'nullable|date',
            'month'               => 'required|integer|min:1|max:12',
            'pelaksana_id'        => 'nullable|integer|exists:users,id',
            'progress_percentage' => 'nullable|integer|min:0|max:100',
        ];
    }

    /**
     * Configure the validator instance.
     *
     * @param  \Illuminate\Validation\Validator  $validator
     * @return void
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function ($validator) {
            $rencanaAksi = $this->route('rencanaAksi');
            $deadline = $this->input('deadline');

            if ($rencanaAksi && $rencanaAksi->target_tanggal && $deadline) {
                if (\Carbon\Carbon::parse($deadline)->gt($rencanaAksi->target_tanggal)) {
                    $validator->errors()->add(
                        'deadline',
                        'Deadline tidak boleh melebihi Target Tanggal Rencana Aksi (' . \Carbon\Carbon::parse($rencanaAksi->target_tanggal)->format('d M Y') . ').'
                    );
                }
            }

            // Validasi bahwa bulan deadline cocok dengan bulan konteks
            $month = $this->input('month');
            if ($deadline && $month) {
                if (\Carbon\Carbon::parse($deadline)->month != $month) {
                    $validator->errors()->add('deadline', 'Bulan pada deadline harus cocok dengan bulan yang dipilih (' . \DateTime::createFromFormat('!m', $month)->format('F') . ').');
                }
            }
        });
    }
}

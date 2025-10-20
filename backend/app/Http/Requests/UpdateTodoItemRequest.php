<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateTodoItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'deskripsi'           => 'sometimes|string|max:255',
            'deadline'            => 'nullable|date',
            'month'               => 'required_with:bobot|nullable|integer|min:1|max:12', // Month is required if bobot is being updated
            'pelaksana_id'        => 'sometimes|nullable|integer|exists:users,id',
            'bobot'               => 'sometimes|integer|min:0|max:100',
            'progress_percentage' => 'sometimes|nullable|integer|min:0|max:100',
            'status_approval'     => 'sometimes|string|in:not_started,pending_upload,pending_approval,approved',
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
        // Validasi bobot hanya jika field 'bobot' ada dalam request
        if ($this->has('bobot')) {
            $validator->after(function ($validator) {
                $todoItem = $this->route('todoItem');
                $rencanaAksi = $todoItem->rencanaAksi;
                $month = $this->input('month') ?? ($todoItem->deadline ? $todoItem->deadline->month : null);
                $newBobot = (int)$this->input('bobot');

                if (!$rencanaAksi || !$month) {
                    // Tambahkan error jika bulan tidak bisa ditentukan, karena ini krusial untuk validasi bobot
                    $validator->errors()->add('month', 'Bulan tidak dapat ditentukan. Pastikan to-do item memiliki deadline atau bulan dikirim dalam request.');
                    return;
                }

                // Hitung total bobot dari item LAIN di bulan yang sama
                $otherItemsBobotSum = $rencanaAksi->todoItems()
                    ->where('id', '!=', $todoItem->id)
                    ->whereMonth('deadline', $month)
                    ->sum('bobot');

                if ($otherItemsBobotSum + $newBobot > 100) {
                    $validator->errors()->add(
                        'bobot',
                        'Total bobot untuk bulan ini tidak boleh melebihi 100%. Sisa bobot yang tersedia: ' . (100 - $otherItemsBobotSum) . '%'
                    );
                }
            });
        }
    }
}

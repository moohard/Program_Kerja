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
            'month'               => 'required|integer|min:1|max:12', // Month is required for bobot validation
            'pelaksana_id'        => 'nullable|integer|exists:users,id',
            'bobot'               => 'required|integer|min:0|max:100',
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
            $month = $this->input('month');
            $newBobot = (int)$this->input('bobot', 0);

            if (!$rencanaAksi || !$month) {
                return; // Dependencies not met, other rules will handle it.
            }

            // Calculate the sum of existing bobot for the given month
            $existingBobotSum = $rencanaAksi->todoItems()
                ->whereMonth('deadline', $month)
                ->sum('bobot');

            if ($existingBobotSum + $newBobot > 100) {
                $validator->errors()->add(
                    'bobot',
                    'Total bobot untuk bulan ini tidak boleh melebihi 100%. Sisa bobot yang tersedia: ' . (100 - $existingBobotSum) . '%'
                );
            }
        });
    }
}

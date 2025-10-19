<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTodoItemRequest extends FormRequest
{

    public function authorize(): bool
    {

        return TRUE;
    }

    public function rules(): array
    {

        return [
            'deskripsi'           => 'required|string|max:255',
            'deadline'            => 'nullable|date',
            'month'               => 'nullable|integer|min:1|max:12',
            'pelaksana_id'        => 'nullable|integer|exists:users,id',
            'bobot'               => 'nullable|integer|min:0|max:100',
            'progress_percentage' => 'nullable|integer|min:0|max:100',
        ];
    }

}

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
}

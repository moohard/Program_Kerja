<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTodoItemRequest extends FormRequest
{

    public function authorize(): bool
    {

        return TRUE;
    }

    public function rules(): array
    {

        return [
            'deskripsi' => 'sometimes|string|max:255',
            'completed' => 'sometimes|boolean',
            'deadline'  => 'nullable|date',
            'month'     => 'nullable|integer|min:1|max:12',
        ];
    }

}

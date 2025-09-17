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
            'deskripsi' => 'sometimes|required|string|max:65535',
            'completed' => 'sometimes|boolean',
            'deadline'  => 'sometimes|nullable|date',
        ];
    }

}

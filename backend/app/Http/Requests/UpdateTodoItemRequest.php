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
            'month'               => 'nullable|integer|min:1|max:12',
            'pelaksana_id'        => 'sometimes|nullable|integer|exists:users,id',
            'progress_percentage' => 'sometimes|nullable|integer|min:0|max:100',
            'status_approval'     => 'sometimes|string|in:not_started,pending_upload,pending_approval,approved,rejected',
        ];
    }
}

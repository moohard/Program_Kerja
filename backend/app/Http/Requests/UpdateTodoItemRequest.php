<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

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
            'rejection_note'      => [
                'nullable',
                'string',
                'max:1000',
                'required_if:status_approval,pending_upload',
                'required_if:status_approval,rejected',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'rejection_note.required_if' => 'Catatan penolakan wajib diisi jika status ditolak atau butuh perbaikan.',
        ];
    }
}

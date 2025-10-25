<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreJabatanRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Assuming any authenticated user can create a Jabatan for now
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'nama_jabatan' => 'required|string|max:255|unique:jabatan,nama_jabatan',
            'bidang' => 'nullable|in:pimpinan,kesekretariatan,kepaniteraan,teknis,hakim',
            'parent_id' => 'nullable|integer|exists:jabatan,id',
            'role' => 'required|string|exists:roles,name',
        ];
    }
}
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateJabatanRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Assuming any authenticated user can update a Jabatan for now
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $jabatanId = $this->route('jabatanItem')->id;

        return [
            'nama_jabatan' => [
                'required',
                'string',
                'max:255',
                Rule::unique('jabatan')->ignore($jabatanId),
            ],
            'bidang' => 'nullable|in:pimpinan,kesekretariatan,kepaniteraan,teknis,hakim',
            'parent_id' => 'nullable|integer|exists:jabatan,id',
            'role' => 'required|string|exists:roles,name',
        ];
    }
}
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateKegiatanRequest extends FormRequest
{

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {

        return TRUE; // Set to true to allow anyone authenticated to use it for now
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {

        return [
            'kategori_id'   => 'sometimes|required|integer|exists:kategori_utama,id',
            'nama_kegiatan' => 'sometimes|required|string|max:65535',
            'is_active'     => 'sometimes|boolean',
        ];
    }

}

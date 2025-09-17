<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProgressMonitoringRequest extends FormRequest
{

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {

        return TRUE; // Autorisasi akan dihandle di controller/policy jika perlu
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {

        return [
            'progress_percentage' => 'required|integer|min:0|max:100',
            'keterangan'          => 'nullable|string|max:1000',
            'attachments'         => 'nullable|array|max:5', // Batasi maksimal 5 file per upload
            'attachments.*'       => 'file|mimes:pdf,jpg,jpeg,png,doc,docx,xls,xlsx|max:2048', // Tipe file dan maks 2MB per file
        ];
    }

}

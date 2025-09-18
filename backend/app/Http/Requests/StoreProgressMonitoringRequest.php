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

        return TRUE;
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
            'keterangan'          => 'nullable|string',
            'report_year'         => 'required|integer|digits:4',
            'report_month'        => 'required|integer|min:1|max:12',
            'attachments'         => 'nullable|array',
            'attachments.*'       => 'file|mimes:pdf,jpg,jpeg,png,xlsx,docx|max:2048', // Maks 2MB per file
        ];
    }

}

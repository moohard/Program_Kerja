<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProgressAttachmentResource extends JsonResource
{

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {

        return [
            'id'           => $this->id,
            'file_name'    => $this->file_name,
            'url'          => $this->url, // Menggunakan accessor 'url' dari model
            'file_size_kb' => round($this->file_size / 1024, 2),
        ];
    }

}

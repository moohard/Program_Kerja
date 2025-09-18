<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProgressMonitoringResource extends JsonResource
{

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {

        return [
            'id'                  => $this->id,
            'progress_percentage' => $this->progress_percentage,
            'keterangan'          => $this->keterangan,
            'tanggal_monitoring'  => $this->tanggalMonitoring?->format('d-m-Y'),
            'created_at'          => $this->createdAt?->format('d-m-Y H:i:s'),
            'attachments'         => ProgressAttachmentResource::collection($this->whenLoaded('attachments')),
        ];
    }

}

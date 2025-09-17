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
            'tanggal_monitoring'  => $this->tanggal_monitoring
                ? $this->tanggal_monitoring->format('d-m-Y')
                : NULL,

            'created_at'          => $this->created_at
                ? $this->created_at->format('d-m-Y H:i:s')
                : NULL,
            'attachments'         => ProgressAttachmentResource::collection($this->whenLoaded('attachments')),

        ];
    }

}

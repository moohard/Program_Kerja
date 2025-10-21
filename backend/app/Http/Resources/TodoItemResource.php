<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\TodoItemAttachmentResource;

class TodoItemResource extends JsonResource
{

    public function toArray(Request $request): array
    {
        return [
            'id'                  => $this->id,
            'rencana_aksi_id'     => $this->rencana_aksi_id,
            'pelaksana_id'        => $this->pelaksana_id,
            'deskripsi'           => $this->deskripsi,
            'progress_percentage' => $this->progress_percentage,
            'status_approval'     => $this->status_approval,
            'is_late_upload'      => $this->is_late_upload,
            'deadline'            => $this->deadline?->toDateTimeString(),
            'created_at'          => $this->created_at->toDateTimeString(),
            'attachments'         => TodoItemAttachmentResource::collection($this->whenLoaded('attachments')),
            'pelaksana'           => new UserResource($this->whenLoaded('pelaksana')),
        ];
    }

}

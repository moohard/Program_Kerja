<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TodoItemResource extends JsonResource
{

    public function toArray(Request $request): array
    {

        return [
            'id'              => $this->id,
            'rencana_aksi_id' => $this->rencana_aksi_id,
            'deskripsi'       => $this->deskripsi,
            'completed'       => $this->completed,
            'deadline'        => $this->deadline?->toDateTimeString(),
            'created_at'      => $this->created_at->toDateTimeString(),
        ];
    }

}

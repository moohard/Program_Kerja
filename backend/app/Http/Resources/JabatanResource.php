<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JabatanResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nama_jabatan' => $this->nama_jabatan,
            'bidang' => $this->bidang,
            'parent_id' => $this->parent_id,
            'parent' => new JabatanResource($this->whenLoaded('parent')),
            'children' => JabatanResource::collection($this->whenLoaded('children')),
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}

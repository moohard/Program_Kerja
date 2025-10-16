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
            'role' => $this->role,
            'parent_id' => $this->parent_id,
            // 'whenLoaded' memastikan relasi hanya disertakan jika sudah di-load
            // Ini mencegah N+1 problem dan error jika relasi tidak di-load
            'users' => UserResource::collection($this->whenLoaded('users')),
            'children' => JabatanResource::collection($this->whenLoaded('children')),
        ];
    }
}
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProgramKerjaResource extends JsonResource
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
            'tahun' => $this->tahun,
            'nama_pengadilan' => $this->nama_pengadilan,
            'is_aktif' => (bool) $this->is_aktif,
        ];
    }
}

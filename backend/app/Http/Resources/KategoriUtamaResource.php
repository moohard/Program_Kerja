<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class KategoriUtamaResource extends JsonResource
{

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {

        return [
            'id'            => $this->id,
            'nomor'         => $this->nomor,
            'nama_kategori' => $this->nama_kategori,
            'is_active'     => $this->is_active,
        ];
    }

}

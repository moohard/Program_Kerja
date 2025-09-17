<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RencanaAksiResource extends JsonResource
{

    public function toArray(Request $request): array
    {

        return [
            'id'              => $this->id,
            'kegiatan_id'     => $this->kegiatan_id,
            'nomor_aksi'      => $this->nomor_aksi,
            'deskripsi_aksi'  => $this->deskripsi_aksi,
            'status'          => $this->status,
            'target_tanggal'  => $this->target_tanggal ? $this->target_tanggal->format('Y-m-d') : NULL,
            'actual_tanggal'  => $this->actual_tanggal ? $this->actual_tanggal->format('Y-m-d') : NULL,
            'catatan'         => $this->catatan,
            'assigned_to'     => $this->assigned_to,
            'jadwal_tipe'     => $this->jadwal_tipe,
            'jadwal_config'   => $this->jadwal_config,
            'priority'        => $this->priority,
            'assigned_user'   => new UserResource($this->whenLoaded('assignedUser')),
            'kegiatan'        => new KegiatanResource($this->whenLoaded('kegiatan')),
            'latest_progress' => $this->whenLoaded('latestProgress', function ()
            {
                return $this->latestProgress->progress_percentage ?? 0;
            }, 0),
        ];
    }

}

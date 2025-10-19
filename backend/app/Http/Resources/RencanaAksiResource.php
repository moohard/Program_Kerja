<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RencanaAksiResource extends JsonResource
{

    public function toArray(Request $request): array
    {

        return [
            'id'               => $this->id,
            'kegiatan_id'      => $this->kegiatan_id,
            'nomor_aksi'       => $this->nomor_aksi,
            'deskripsi_aksi'   => $this->deskripsi_aksi,
            'status'           => $this->status,
            'target_tanggal'   => $this->target_tanggal,
            'actual_tanggal'   => $this->actual_tanggal,
            'catatan'          => $this->catatan,
            'priority'         => $this->priority,
            'jadwal_tipe'      => $this->jadwal_tipe,
            'jadwal_config'    => $this->jadwal_config,
            'target_months'    => $this->target_months, // Tambahkan baris ini
            'monthly_status'   => $this->when(isset($this->monthly_status), $this->monthly_status),
            'assigned_to'      => new UserResource($this->whenLoaded('assignedTo')),
            'progress_history' => ProgressMonitoringResource::collection($this->whenLoaded('progressMonitorings')),
            'latest_progress'  => $this->latest_progress_percentage,
        ];
    }

}

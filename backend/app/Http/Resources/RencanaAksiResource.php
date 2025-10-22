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
            'target_months'    => $this->target_months,
            'tahun'            => $this->tahun,
            'bulan'            => $this->bulan,

            // Progress keseluruhan - SELALU dihitung dari semua data melalui accessor
            'overall_progress' => $this->overall_progress_percentage,

            // Progress untuk bulan yang difilter (jika ada)
            'monthly_progress' => $this->when(isset($this->filtered_monthly_progress), function () {
                if ($this->filtered_monthly_progress instanceof \App\Models\ProgressMonitoring) {
                    return new ProgressMonitoringResource($this->filtered_monthly_progress);
                }
                return $this->filtered_monthly_progress;
            }),

            'assigned_to'      => new UserResource($this->whenLoaded('assignedTo')),
            'progress_history' => ProgressMonitoringResource::collection($this->whenLoaded('progressMonitorings')),
            'todo_items'       => TodoItemResource::collection($this->whenLoaded('todoItems')),
        ];
    }

}

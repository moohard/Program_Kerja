<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RencanaAksiResource extends JsonResource
    {

    // public function toArray(Request $request): array
    //     {

    //     return [
    //         'id'               => $this->id,
    //         'kegiatan_id'      => $this->kegiatan_id,
    //         'nomor_aksi'       => $this->nomor_aksi,
    //         'deskripsi_aksi'   => $this->deskripsi_aksi,
    //         'status'           => $this->status,
    //         'target_tanggal'   => $this->target_tanggal?->format('Y-m-d'),
    //         'actual_tanggal'   => $this->actual_tanggal?->format('Y-m-d'),
    //         'catatan'          => $this->catatan,
    //         'assigned_to'      => $this->assigned_to,
    //         'jadwal_tipe'      => $this->jadwal_tipe,
    //         'jadwal_config'    => $this->jadwal_config,
    //         'priority'         => $this->priority,
    //         'assigned_user'    => new UserResource($this->whenLoaded('assignedUser')),
    //         'kegiatan'         => new KegiatanResource($this->whenLoaded('kegiatan')),
    //         'progress_history' => ProgressMonitoringResource::collection($this->whenLoaded('progressMonitorings')),
    //         'latest_progress'  => $this->latest_progress,
    //     ];
    //     }

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
            'assigned_to'      => new UserResource($this->whenLoaded('assignedTo')),
            'progress_history' => ProgressMonitoringResource::collection($this->whenLoaded('progressMonitorings')),

            // [FIX] - Menambahkan kembali atribut latest_progress
            // Ini akan secara otomatis memanggil accessor getLatestProgressAttribute di model.
            'latest_progress'  => $this->latest_progress,
        ];
        }
    }
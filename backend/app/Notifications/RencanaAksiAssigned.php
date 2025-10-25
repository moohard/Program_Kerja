<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\Notification as FirebaseNotification;
use App\Models\RencanaAksi;

class RencanaAksiAssigned extends Notification
{
    use Queueable;

    protected $rencanaAksi;

    public function __construct(RencanaAksi $rencanaAksi)
    {
        $this->rencanaAksi = $rencanaAksi;
    }

    public function via(object $notifiable): array
    {
        return ['fcm', 'database'];
    }

    public function toFcm(object $notifiable): array
    {
        return [
            'notification' => FirebaseNotification::create()
                ->withTitle('Tugas Baru Untuk Anda!')
                ->withBody("Anda ditugaskan untuk: {$this->rencanaAksi->deskripsi_aksi}"),
            'data' => [
                'type' => 'rencana_aksi_assigned',
                'title' => 'Tugas Baru Untuk Anda!',
                'body' => "Anda ditugaskan untuk: {$this->rencanaAksi->deskripsi_aksi}",
                'rencana_aksi_id' => (string) $this->rencanaAksi->id,
                'click_action' => '/rencana-aksi'
            ]
        ];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'rencana_aksi_id' => $this->rencanaAksi->id,
            'title' => 'Tugas Baru Untuk Anda!',
            'message' => "Anda telah ditugaskan bertanggung jawab dalam <strong>{$this->rencanaAksi->deskripsi_aksi}</strong>.",
            'type' => 'rencana_aksi_assigned',
            'timestamp' => now()->toISOString()
        ];
    }
}
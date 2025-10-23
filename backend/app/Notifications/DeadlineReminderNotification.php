<?php

namespace App\Notifications;

use App\Models\RencanaAksi;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Kreait\Firebase\Messaging\Notification as FirebaseNotification;

class DeadlineReminderNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $rencanaAksi;

    public function __construct(RencanaAksi $rencanaAksi)
    {
        $this->rencanaAksi = $rencanaAksi;
    }

    public function via($notifiable)
    {
        return ['fcm', 'database'];
    }

    public function toFcm($notifiable): array
    {
        $deadline = \Carbon\Carbon::parse($this->rencanaAksi->target_tanggal)->format('d M Y');
        $title = 'Pengingat: Deadline Mendekat';
        $body = "Tugas '{$this->rencanaAksi->deskripsi_aksi}' akan berakhir pada {$deadline}.";

        return [
            'notification' => FirebaseNotification::create($title, $body),
            'data' => [
                'type' => 'deadline_reminder',
                'title' => $title,
                'body' => $body,
                'rencana_aksi_id' => (string) $this->rencanaAksi->id,
                'click_action' => '/rencana-aksi'
            ]
        ];
    }

    public function toDatabase($notifiable): array
    {
        $deadline = \Carbon\Carbon::parse($this->rencanaAksi->target_tanggal)->format('d M Y');
        return [
            'rencana_aksi_id' => $this->rencanaAksi->id,
            'title' => 'Pengingat: Deadline Mendekat',
            'message' => "Tugas '{$this->rencanaAksi->deskripsi_aksi}' akan berakhir pada {$deadline}.",
            'type' => 'deadline_reminder',
        ];
    }
}
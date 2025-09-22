<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\Notification as FirebaseNotification;
use NotificationChannels\Fcm\FcmChannel;
use NotificationChannels\Fcm\FcmMessage;

class RencanaAksiAssignedNotification extends Notification
{
    use Queueable;

    private $rencanaAksi;

    public function __construct($rencanaAksi)
    {
        $this->rencanaAksi = $rencanaAksi;
    }

    public function via($notifiable): array
    {
        // Kita akan kirim ke 2 channel: database (untuk web) dan fcm (untuk Flutter)
        return ['database', FcmChannel::class];
    }

    // Format notifikasi untuk disimpan di database
    public function toDatabase($notifiable): array
    {
        return [
            'title' => 'Tugas Baru Diberikan',
            'body' => 'Anda diberi tugas baru: ' . $this->rencanaAksi->deskripsi_aksi,
            'rencana_aksi_id' => $this->rencanaAksi->id,
            'type' => 'RencanaAksiAssigned',
        ];
    }

    // Format notifikasi untuk dikirim ke Flutter via FCM
    public function toFcm($notifiable): FcmMessage
    {
        return FcmMessage::create()
            ->setNotification(FirebaseNotification::create(
                'Tugas Baru Diberikan',
                'Anda diberi tugas baru: ' . $this->rencanaAksi->deskripsi_aksi
            ))
            ->setData([
                'type' => 'rencana_aksi', // Tipe notifikasi
                'id' => (string) $this->rencanaAksi->id, // ID dari Rencana Aksi
            ]);
    }

    // Method ini dibutuhkan oleh FcmChannel
    public function fcmProject($notifiable, $message)
    {
        return 'app';
    }
}
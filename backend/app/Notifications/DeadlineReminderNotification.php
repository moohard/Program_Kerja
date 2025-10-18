<?php

namespace App\Notifications;

use App\Models\RencanaAksi;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\Notification as FirebaseNotification;
use App\Channels\FcmChannel;

class DeadlineReminderNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $rencanaAksi;

    /**
     * Create a new notification instance.
     *
     * @param RencanaAksi $rencanaAksi
     */
    public function __construct(RencanaAksi $rencanaAksi)
    {
        $this->rencanaAksi = $rencanaAksi;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        return [FcmChannel::class];
    }

    /**
     * Get the FCM representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return \Kreait\Firebase\Messaging\CloudMessage
     */
    public function toFcm($notifiable)
    {
        $deadline = $this->rencanaAksi->target_tanggal->format('d M Y');
        $title = 'Pengingat Deadline Mendekat';
        $body = "Tugas '{$this->rencanaAksi->deskripsi_aksi}' akan berakhir pada {$deadline}.";

        return CloudMessage::new()
            ->withNotification(FirebaseNotification::create($title, $body))
            ->withData([
                'fcm_options' => [
                    'link' => '/program-kerja/' . $this->rencanaAksi->kegiatan->programKerja->id,
                ],
                'notification_type' => 'deadline_reminder',
                'rencana_aksi_id' => (string) $this->rencanaAksi->id,
            ]);
    }
}

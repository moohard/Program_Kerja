<?php

namespace App\Notifications;

use App\Models\TodoItem;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Kreait\Firebase\Messaging\Notification as FirebaseNotification;

class EvidenceUploaded extends Notification
{
    use Queueable;

    protected $todoItem;

    /**
     * Create a new notification instance.
     */
    public function __construct(TodoItem $todoItem)
    {
        $this->todoItem = $todoItem;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['fcm', 'database'];
    }

    /**
     * Get the FCM representation of the notification.
     */
    public function toFcm(object $notifiable): array
    {
        $pelaksanaName = $this->todoItem->pelaksana->name ?? 'Pelaksana';
        $title = "Eviden Baru Menunggu Validasi";
        $body = "{$pelaksanaName} telah mengunggah eviden untuk tugas: \"{$this->todoItem->deskripsi}\"" ;

        return [
            'notification' => FirebaseNotification::create()
                ->withTitle($title)
                ->withBody($body),
            'data' => [
                'type' => 'evidence_uploaded',
                'title' => $title,
                'body' => $body,
                'rencana_aksi_id' => (string) $this->todoItem->rencana_aksi_id,
                'todo_item_id' => (string) $this->todoItem->id,
                'click_action' => '/rencana-aksi' // Arahkan ke halaman detail
            ]
        ];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toDatabase(object $notifiable): array
    {
        $pelaksanaName = $this->todoItem->pelaksana->name ?? 'Pelaksana';
        $title = "Eviden Baru Menunggu Validasi";
        $message = "{$pelaksanaName} telah mengunggah eviden untuk tugas: \"{$this->todoItem->deskripsi}\"" ;

        return [
            'rencana_aksi_id' => $this->todoItem->rencana_aksi_id,
            'todo_item_id' => $this->todoItem->id,
            'title' => $title,
            'message' => $message,
            'type' => 'evidence_uploaded',
        ];
    }
}
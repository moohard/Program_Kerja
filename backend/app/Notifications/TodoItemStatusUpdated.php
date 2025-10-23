<?php

namespace App\Notifications;

use App\Models\TodoItem;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Kreait\Firebase\Messaging\Notification as FirebaseNotification;

class TodoItemStatusUpdated extends Notification
{
    use Queueable;

    protected $todoItem;

    public function __construct(TodoItem $todoItem)
    {
        $this->todoItem = $todoItem;
    }

    public function via(object $notifiable): array
    {
        return ['fcm', 'database'];
    }

    public function toFcm(object $notifiable): array
    {
        $statusText = $this->getStatusText($this->todoItem->status_approval);
        $title = "Status To-Do Diperbarui: {$statusText}";

        return [
            'notification' => FirebaseNotification::create()
                ->withTitle($title)
                ->withBody($this->todoItem->deskripsi),
            'data' => [
                'type' => 'todo_item_status_updated',
                'title' => $title,
                'body' => $this->todoItem->deskripsi,
                'rencana_aksi_id' => (string) $this->todoItem->rencana_aksi_id,
                'todo_item_id' => (string) $this->todoItem->id,
                'click_action' => '/rencana-aksi'
            ]
        ];
    }

    public function toDatabase(object $notifiable): array
    {
        $statusText = $this->getStatusText($this->todoItem->status_approval);
        return [
            'rencana_aksi_id' => $this->todoItem->rencana_aksi_id,
            'todo_item_id' => $this->todoItem->id,
            'title' => "Status To-Do Diperbarui: {$statusText}",
            'message' => $this->todoItem->deskripsi,
            'type' => 'todo_item_status_updated',
        ];
    }

    private function getStatusText(string $status): string
    {
        switch ($status) {
            case 'approved':
                return 'Disetujui';
            case 'pending_upload':
                return 'Ditolak (Perlu Revisi)';
            case 'rejected': // Fallback, in case this status is used directly
                return 'Ditolak (Perlu Revisi)';
            default:
                return ucfirst($status);
        }
    }
}
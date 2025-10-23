<?php

namespace App\Notifications;

use App\Models\TodoItem;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Kreait\Firebase\Messaging\Notification as FirebaseNotification;

class TodoItemAssigned extends Notification
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
        return [
            'notification' => FirebaseNotification::create()
                ->withTitle('To-Do Baru Ditugaskan Kepada Anda')
                ->withBody($this->todoItem->deskripsi),
            'data' => [
                'type' => 'todo_item_assigned',
                'title' => 'To-Do Baru Ditugaskan Kepada Anda',
                'body' => $this->todoItem->deskripsi,
                'rencana_aksi_id' => (string) $this->todoItem->rencana_aksi_id,
                'todo_item_id' => (string) $this->todoItem->id,
                'click_action' => '/rencana-aksi'
            ]
        ];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'rencana_aksi_id' => $this->todoItem->rencana_aksi_id,
            'todo_item_id' => $this->todoItem->id,
            'title' => 'To-Do Baru Ditugaskan Kepada Anda',
            'message' => $this->todoItem->deskripsi,
            'type' => 'todo_item_assigned',
        ];
    }
}
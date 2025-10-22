<?php

namespace App\Observers;

use App\Models\TodoItem;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;

class TodoItemObserver
{
    /**
     * Handle the TodoItem "created" event.
     */
    public function created(TodoItem $todoItem): void
    {
        AuditLog::create([
            'user_id'    => Auth::id(),
            'action'     => 'CREATE',
            'table_name' => 'todo_items',
            'record_id'  => $todoItem->id,
            'new_values' => $todoItem->toJson(),
        ]);
    }

    /**
     * Handle the TodoItem "updated" event.
     */
    public function updated(TodoItem $todoItem): void
    {
        $changes = $todoItem->getChanges();
        $action = 'UPDATE'; // Default action

        if (array_key_exists('status_approval', $changes)) {
            switch ($changes['status_approval']) {
                case 'approved':
                    $action = 'APPROVE';
                    break;
                case 'pending_upload':
                    $action = 'REJECT';
                    break;
                case 'pending_approval':
                    $action = 'SUBMIT';
                    break;
            }
        }

        AuditLog::create([
            'user_id'    => Auth::id(),
            'action'     => $action,
            'table_name' => 'todo_items',
            'record_id'  => $todoItem->id,
            'old_values' => json_encode($todoItem->getOriginal()),
            'new_values' => json_encode($changes),
        ]);
    }

    /**
     * Handle the TodoItem "deleted" event.
     */
    public function deleted(TodoItem $todoItem): void
    {
        AuditLog::create([
            'user_id'    => Auth::id(),
            'action'     => 'DELETE',
            'table_name' => 'todo_items',
            'record_id'  => $todoItem->id,
            'old_values' => $todoItem->toJson(),
        ]);
    }
}

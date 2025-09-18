<?php

namespace App\Observers;

use App\Models\RencanaAksi;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;

class RencanaAksiObserver
{
    /**
     * Handle the RencanaAksi "created" event.
     */
    public function created(RencanaAksi $rencanaAksi): void
    {
        AuditLog::create([
            'user_id'    => Auth::id(),
            'action'     => 'CREATE',
            'table_name' => 'rencana_aksi',
            'record_id'  => $rencanaAksi->id,
            'new_values' => $rencanaAksi->toJson(),
        ]);
    }

    /**
     * Handle the RencanaAksi "updated" event.
     */
    public function updated(RencanaAksi $rencanaAksi): void
    {
        AuditLog::create([
            'user_id'    => Auth::id(),
            'action'     => 'UPDATE',
            'table_name' => 'rencana_aksi',
            'record_id'  => $rencanaAksi->id,
            'old_values' => json_encode($rencanaAksi->getOriginal()),
            'new_values' => json_encode($rencanaAksi->getChanges()),
        ]);
    }

    /**
     * Handle the RencanaAksi "deleted" event.
     */
    public function deleted(RencanaAksi $rencanaAksi): void
    {
        AuditLog::create([
            'user_id'    => Auth::id(),
            'action'     => 'DELETE',
            'table_name' => 'rencana_aksi',
            'record_id'  => $rencanaAksi->id,
            'old_values' => $rencanaAksi->toJson(),
        ]);
    }
}

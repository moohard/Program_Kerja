<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{

    use HasFactory;

    protected $table = 'audit_logs';

    protected $fillable = [
        'user_id',
        'action',
        'table_name',
        'record_id',
        'old_values',
        'new_values',
        'description',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user that performed the action.
     */
    public function user()
    {

        return $this->belongsTo(User::class);
    }

    /**
     * Scope a query to filter by table name.
     */
    public function scopeForTable($query, $tableName)
    {

        return $query->where('table_name', $tableName);
    }

    /**
     * Scope a query to filter by record ID.
     */
    public function scopeForRecord($query, $recordId)
    {

        return $query->where('record_id', $recordId);
    }

    /**
     * Scope a query to filter by action type.
     */
    public function scopeForAction($query, $action)
    {

        return $query->where('action', $action);
    }

    /**
     * Get the formatted old values.
     */
    public function getFormattedOldValuesAttribute()
    {

        return $this->old_values ? json_encode($this->old_values, JSON_PRETTY_PRINT) : NULL;
    }

    /**
     * Get the formatted new values.
     */
    public function getFormattedNewValuesAttribute()
    {

        return $this->new_values ? json_encode($this->new_values, JSON_PRETTY_PRINT) : NULL;
    }

}

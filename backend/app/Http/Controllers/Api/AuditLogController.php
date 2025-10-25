<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AuditLogController extends Controller
{

    public function index(Request $request)
    {
        Log::info('Audit Log Filters:', $request->all());

        $query = AuditLog::with('user:id,name')->latest();

        // Filtering
        if ($request->filled('user_id'))
        {
            $query->where('user_id', $request->user_id);
        }
        if ($request->filled('action'))
        {
            $query->where('action', $request->action);
        }
        if ($request->filled('start_date') && $request->filled('end_date'))
        {
            $query->whereBetween('created_at', [ $request->start_date, $request->end_date . ' 23:59:59' ]);
        }

        Log::info('Audit Log Query:', [$query->toSql(), $query->getBindings()]);

        return $query->paginate(15);
    }

}

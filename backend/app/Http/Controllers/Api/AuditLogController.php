<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{

    public function index(Request $request)
    {

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

        return $query->paginate(15);
    }

}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $user = Auth::user();

        // Ambil notifikasi yang belum dibaca dan yang sudah dibaca, batasi jumlahnya
        $unreadNotifications = $user->unreadNotifications()->latest()->take(10)->get();
        $readNotifications = $user->readNotifications()->latest()->take(5)->get();

        return response()->json([
            'unread' => $unreadNotifications,
            'read' => $readNotifications,
        ]);
    }

    /**
     * Mark the specified notification as read.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function markAsRead(Request $request)
    {
        $request->validate([
            'id' => 'required|string|exists:notifications,id',
        ]);

        $user = Auth::user();
        $notification = $user->notifications()->findOrFail($request->id);
        $notification->markAsRead();

        return response()->json(['message' => 'Notification marked as read.']);
    }
}

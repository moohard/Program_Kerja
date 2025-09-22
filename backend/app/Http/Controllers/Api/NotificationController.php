<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
    {
    // Untuk mengambil token perangkat dari Flutter
    public function storeDeviceToken(Request $request)
        {
        $validated = $request->validate(['token' => 'required|string']);
        Auth::user()->deviceTokens()->updateOrCreate(
            ['token' => $validated['token']],
            ['device_name' => $request->header('User-Agent')],
        );
        return response()->json(['message' => 'Token disimpan.']);
        }

    // Untuk menampilkan notifikasi di web
    public function getInAppNotifications()
        {
        return Auth::user()->unreadNotifications;
        }

    public function markAsRead(Request $request)
        {
        Auth::user()->unreadNotifications->where('id', $request->id)->markAsRead();
        return response()->noContent();
        }
    }
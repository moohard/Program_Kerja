<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\DeviceToken;

class NotificationController extends Controller
{
    public function storeToken(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
        ]);

        // Gunakan updateOrCreate untuk menghindari duplikat
        DeviceToken::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'token' => $request->token,
            ]
        );

        return response()->json(['message' => 'Token stored successfully.']);
    }
}
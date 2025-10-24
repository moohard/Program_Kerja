<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateProfileRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class ProfileController extends Controller
{
    /**
     * Get the authenticated user's profile.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(): JsonResponse
    {
        return response()->json(Auth::user());
    }

    /**
     * Update the authenticated user's profile.
     *
     * @param \App\Http\Requests\UpdateProfileRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $user = Auth::user();

        // Update name and email
        $user->name = $request->name;
        $user->email = $request->email;

        // Update password if provided
        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            $disk = Storage::disk('avatars');

            // Delete old avatar if it exists
            if ($user->photo_url) {
                // The URL is relative like /storage/avatars/file.png, 
                // but the disk root is storage/app/public/avatars.
                // We need to get the filename from the URL.
                $filename = basename($user->photo_url);
                if ($disk->exists($filename)) {
                    $disk->delete($filename);
                }
            }

            // Store new avatar in the root of the 'avatars' disk and get filename
            $path = $request->file('avatar')->store('.', 'avatars');
            
            // Generate the correct relative URL
            $user->photo_url = $disk->url($path);
        }

        $user->save();

        return response()->json($user);
    }
}
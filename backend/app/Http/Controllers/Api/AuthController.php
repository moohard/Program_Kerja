<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{

    public function login(Request $request)
    {

        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password))
        {
            throw ValidationException::withMessages([
                'email' => [ 'Kredensial yang diberikan tidak cocok.' ],
            ]);
        }

        if (!$user->is_active)
        {
            return response()->json([ 'message' => 'Akun Anda tidak aktif.' ], 403);
        }

        $user->load('jabatan'); // Eager load relasi jabatan
        $permissions = $user->getAllPermissions()->pluck('name');

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'user'  => [
                'id'      => $user->id,
                'name'    => $user->name,
                'email'   => $user->email,
                'jabatan' => $user->jabatan,
                'permissions' => $permissions,
            ],
            'token' => $token,
        ]);
    }

    /**
     * Get the authenticated User.
     */
    public function user(Request $request)
    {
        $user = $request->user()->load('jabatan');
        $permissions = $user->getAllPermissions()->pluck('name');

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'jabatan' => $user->jabatan,
            'permissions' => $permissions,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logout berhasil']);
    }
}

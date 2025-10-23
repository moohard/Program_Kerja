<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $users = User::with('jabatan')->latest()->paginate(100);
        return UserResource::collection($users);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUserRequest $request)
    {
        $validated = $request->validated();
        $validated['password'] = Hash::make($validated['password']);

        $user = User::create($validated);

        if ($request->has('roles')) {
            $user->assignRole($request->roles);
        }

        return new UserResource($user->load('roles'));
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        return new UserResource($user->load('jabatan'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUserRequest $request, User $user)
    {
        $validated = $request->validated();

        // Hash password if it's being updated
        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']); // Don't update password if it's empty
        }

        $user->update($validated);

        if ($request->has('roles')) {
            $user->syncRoles($request->roles);
        }

        return new UserResource($user->load('roles'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        // Add any pre-deletion logic here, e.g., re-assigning tasks.
        $user->delete();
        return response()->noContent();
    }
}
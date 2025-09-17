<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;

class UserController extends Controller
{

    public function index()
    {

        // Only return active users for assignment
        return UserResource::collection(User::where('is_active', TRUE)->orderBy('name')->get());
    }

}

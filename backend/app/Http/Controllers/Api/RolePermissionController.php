<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionController extends Controller
{
    /**
     * Mengambil semua role beserta permission yang dimilikinya.
     */
    public function indexRoles()
    {
        // Eager load permissions untuk efisiensi
        $roles = Role::with('permissions')->get();

        return response()->json($roles);
    }

    /**
     * Mengambil semua permission yang tersedia beserta deskripsinya.
     */
    public function indexPermissions()
    {
        $permissions = Permission::all();
        $descriptions = config('permission_descriptions.descriptions');

        $formattedPermissions = $permissions->map(function ($permission) use ($descriptions) {
            return [
                'name' => $permission->name,
                'description' => $descriptions[$permission->name] ?? 'Tidak ada deskripsi.',
            ];
        });

        return response()->json($formattedPermissions);
    }

    /**
     * Mensinkronkan (update) permission untuk sebuah role.
     */
    public function syncPermissions(Request $request, Role $role)
    {
        $request->validate([
            'permissions' => 'required|array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        // Jangan biarkan admin menghapus permission super admin dari role-nya sendiri
        if ($role->name === 'admin') {
            if (!in_array('manage roles and permissions', $request->permissions)) {
                return response()->json(['message' => 'Tidak dapat menghapus permission "manage roles and permissions" dari role Admin.'], 422);
            }
        }

        $role->syncPermissions($request->permissions);

        return response()->json(['message' => 'Permissions updated successfully.']);
    }
}
<?php

namespace App\Policies;

use App\Models\RencanaAksi;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class RencanaAksiPolicy
{
    /**
     * Perform pre-authorization checks.
     */
    public function before(User $user, string $ability): bool|null
    {
        // Admin can do anything
        if ($user->hasRole('admin')) {
            return true;
        }

        return null;
    }

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('view all data');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, RencanaAksi $rencanaAksi): bool
    {
        // User can view if they have global view access, or if it's assigned to them.
        return $user->can('view all data') || $user->id === $rencanaAksi->assigned_to;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->can('create rencana aksi');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, RencanaAksi $rencanaAksi): bool
    {
        if (!$user->can('edit rencana aksi')) {
            return false;
        }
        // Allow if user has global view permission (like a pimpinan) OR if they are the direct assignee.
        return $user->can('view all data') || $user->id === $rencanaAksi->assigned_to;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, RencanaAksi $rencanaAksi): bool
    {
        if (!$user->can('delete rencana aksi')) {
            return false;
        }
        // Allow if user has global view permission (like a pimpinan) OR if they are the direct assignee.
        return $user->can('view all data') || $user->id === $rencanaAksi->assigned_to;
    }

    /**
     * Determine whether the user can assign the model.
     */
    public function assign(User $user): bool
    {
        return $user->can('assign rencana aksi');
    }
}
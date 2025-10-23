<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RbacSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // === DEFINISI PERMISSIONS ===
        Permission::create(['name' => 'manage users']);
        Permission::create(['name' => 'manage jabatan']);
        Permission::create(['name' => 'manage master data']);

        Permission::create(['name' => 'view all data']);
        Permission::create(['name' => 'view team data']); // Permission baru untuk manajer
        Permission::create(['name' => 'create rencana aksi']);
        Permission::create(['name' => 'edit rencana aksi']);
        Permission::create(['name' => 'delete rencana aksi']);
        Permission::create(['name' => 'assign rencana aksi']);
        Permission::create(['name' => 'approve todo']);
        Permission::create(['name' => 'upload evidence']);
        Permission::create(['name' => 'manage own todos']);

        // === DEFINISI ROLES & PEMBERIAN PERMISSIONS ===

        // 1. Admin: Semua hak akses
        $adminRole = Role::create(['name' => 'admin']);
        $adminRole->givePermissionTo(Permission::all());

        // 2. Pimpinan: Akses lihat global + hak manajerial
        $pimpinanRole = Role::create(['name' => 'pimpinan']);
        $pimpinanRole->givePermissionTo([
            'view all data',
            'create rencana aksi', 'edit rencana aksi', 'delete rencana aksi',
            'assign rencana aksi',
            'approve todo',
            'manage own todos',
            'upload evidence'
        ]);

        // 3. Manajer: Pimpinan Bidang, terbatas pada timnya
        $manajerRole = Role::create(['name' => 'manajer']);
        $manajerRole->givePermissionTo([
            'view team data', // Menggunakan permission baru
            'create rencana aksi', 'edit rencana aksi', 'delete rencana aksi',
            'assign rencana aksi',
            'approve todo',
            'manage own todos',
            'upload evidence'
        ]);

        // 4. Staff: Eksekutor
        $staffRole = Role::create(['name' => 'staff']);
        $staffRole->givePermissionTo(['manage own todos', 'upload evidence']);

        // 5. Pengawas: Auditor (Read-only)
        $pengawasRole = Role::create(['name' => 'pengawas']);
        $pengawasRole->givePermissionTo('view all data');

        // 6. Operator: Juru Tulis / Input Rencana Aksi
        $operatorRole = Role::create(['name' => 'operator']);
        $operatorRole->givePermissionTo([
            'create rencana aksi',
            'edit rencana aksi',
            'delete rencana aksi',
            'assign rencana aksi'
        ]);
    }
}
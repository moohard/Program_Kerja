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
        Permission::firstOrCreate(['name' => 'manage users']);
        Permission::firstOrCreate(['name' => 'manage jabatan']);
        Permission::firstOrCreate(['name' => 'manage master data']);

        Permission::firstOrCreate(['name' => 'view all data']);
        Permission::firstOrCreate(['name' => 'view team data']); // Permission baru untuk manajer
        Permission::firstOrCreate(['name' => 'create rencana aksi']);
        Permission::firstOrCreate(['name' => 'edit rencana aksi']);
        Permission::firstOrCreate(['name' => 'delete rencana aksi']);
        Permission::firstOrCreate(['name' => 'assign rencana aksi']);
        Permission::firstOrCreate(['name' => 'approve todo']);
        Permission::firstOrCreate(['name' => 'upload evidence']);
        Permission::firstOrCreate(['name' => 'manage own todos']);
        Permission::firstOrCreate(['name' => 'manage roles and permissions']); // Permission baru

        // === DEFINISI ROLES & PEMBERIAN PERMISSIONS ===

        // 1. Admin: Semua hak akses
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $adminRole->syncPermissions(Permission::all());

        // 2. Pimpinan: Akses lihat global + hak manajerial
        $pimpinanRole = Role::firstOrCreate(['name' => 'pimpinan']);
        $pimpinanRole->syncPermissions([
            'view all data',
            'create rencana aksi', 'edit rencana aksi', 'delete rencana aksi',
            'assign rencana aksi',
            'approve todo',
            'manage own todos',
            'upload evidence'
        ]);

        // 3. Manajer: Pimpinan Bidang, terbatas pada timnya
        $manajerRole = Role::firstOrCreate(['name' => 'manajer']);
        $manajerRole->syncPermissions([
            'view team data', // Menggunakan permission baru
            'create rencana aksi', 'edit rencana aksi', 'delete rencana aksi',
            'assign rencana aksi',
            'approve todo',
            'manage own todos',
            'upload evidence'
        ]);

        // 4. Staff: Eksekutor
        $staffRole = Role::firstOrCreate(['name' => 'staff']);
        $staffRole->syncPermissions(['manage own todos', 'upload evidence']);

        // 5. Pengawas: Auditor (Read-only)
        $pengawasRole = Role::firstOrCreate(['name' => 'pengawas']);
        $pengawasRole->syncPermissions('view all data');

        // 6. Operator: Juru Tulis / Input Rencana Aksi
        $operatorRole = Role::firstOrCreate(['name' => 'operator']);
        $operatorRole->syncPermissions([
            'create rencana aksi',
            'edit rencana aksi',
            'delete rencana aksi',
            'assign rencana aksi'
        ]);
    }
}
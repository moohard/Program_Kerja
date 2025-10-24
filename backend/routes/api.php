<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\KategoriUtamaController;
use App\Http\Controllers\Api\KegiatanController;
use App\Http\Controllers\Api\ProgramKerjaController;
use App\Http\Controllers\Api\RencanaAksiController;
use App\Http\Controllers\Api\TodoItemController;
use App\Http\Controllers\Api\ProgressMonitoringController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\JabatanController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\TodoItemAttachmentController;
use App\Http\Controllers\Api\DeviceTokenController;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register-device', [AuthController::class, 'registerDevice']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/device-tokens', [DeviceTokenController::class, 'store']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Profile routes
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::post('/profile', [ProfileController::class, 'update']);

    Route::get('/dashboard', [DashboardController::class, 'index']);


    Route::apiResource('program-kerja', ProgramKerjaController::class);
    Route::get('/program-kerja/{programKerja}/filter-options', [ProgramKerjaController::class, 'getFilterOptions']);
    Route::apiResource('kategori-utama', KategoriUtamaController::class);
    Route::apiResource('kegiatan', KegiatanController::class);
    Route::apiResource('rencana-aksi', RencanaAksiController::class);
    Route::post('rencana-aksi/import', [RencanaAksiController::class, 'import']);
    Route::get('rencana-aksi-template', [RencanaAksiController::class, 'downloadTemplate']);

    // Nested routes for TodoItems under RencanaAksi
    Route::get('/rencana-aksi/{rencanaAksi}/todo-items', [TodoItemController::class, 'index']);
    Route::post('/rencana-aksi/{rencanaAksi}/todo-items', [TodoItemController::class, 'store']);

    Route::apiResource('todo-items', TodoItemController::class)->except(['index', 'store']);
    Route::post('/todo-items/{todoItem}/approve', [TodoItemController::class, 'approve']);
    Route::post('/todo-items/{todoItem}/reject', [TodoItemController::class, 'reject']);
    Route::post('/todo-items/{todoItem}/attachments', [TodoItemAttachmentController::class, 'store']);


    Route::apiResource('progress-monitoring', ProgressMonitoringController::class)->except(['update']);
    Route::post('progress-monitoring/{progressMonitoring}', [ProgressMonitoringController::class, 'update']); // Handle form-data

    Route::get('reports/monthly', [ReportController::class, 'monthly']);
    Route::get('reports/matrix', [ReportController::class, 'matrix']);
    Route::get('reports/export-matrix', [ReportController::class, 'exportMatrix']);
    Route::get('reports/annual-summary', [ReportController::class, 'annualSummary']);
    Route::post('reports/export-annual-summary', [ReportController::class, 'exportAnnualSummary']);

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/mark-as-read', [NotificationController::class, 'markAsRead']);

    // Routes for Jabatan and User Management
    // Route::apiResource('jabatan', JabatanController::class); // Replaced for debugging
    Route::get('jabatan', [JabatanController::class, 'index']);
    Route::get('jabatan/assignable-tree', [JabatanController::class, 'getAssignableTree']);
    Route::post('jabatan', [JabatanController::class, 'store']);
    Route::get('jabatan/{jabatan}', [JabatanController::class, 'show']);
    Route::put('jabatan/{jabatanItem}', [JabatanController::class, 'update']);
    Route::delete('jabatan/{jabatanItem}', [JabatanController::class, 'destroy']);

    Route::apiResource('users', UserController::class);

    // Routes for Role & Permission Management (Admin Only)
    Route::middleware('permission:manage roles and permissions')->group(function () {
        Route::get('/roles', [\App\Http\Controllers\Api\RolePermissionController::class, 'indexRoles']);
        Route::get('/permissions', [\App\Http\Controllers\Api\RolePermissionController::class, 'indexPermissions']);
        Route::post('/roles/{role}/permissions', [\App\Http\Controllers\Api\RolePermissionController::class, 'syncPermissions']);
    });
});

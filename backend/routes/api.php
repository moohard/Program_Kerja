<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\KategoriUtamaController;
use App\Http\Controllers\Api\KegiatanController;
use App\Http\Controllers\Api\RencanaAksiController;
use App\Http\Controllers\Api\TodoItemController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ProgressMonitoringController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\TemplateController;
use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\NotificationController;

// Public routes
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);

    // Resourceful routes
    Route::apiResource('kategori-utama', KategoriUtamaController::class);
    Route::apiResource('kegiatan', KegiatanController::class);
    Route::apiResource('rencana-aksi', RencanaAksiController::class);

    // Nested routes for To-Do Items
    Route::get('/rencana-aksi/{rencanaAksi}/todos', [TodoItemController::class, 'index']);
    Route::post('/rencana-aksi/{rencanaAksi}/todos', [TodoItemController::class, 'store']);
    Route::put('/todos/{todoItem}', [TodoItemController::class, 'update']);
    Route::delete('/todos/{todoItem}', [TodoItemController::class, 'destroy']);

    // Utility routes
    Route::get('users', [UserController::class, 'index']);
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/reports/monthly', [ReportController::class, 'monthly']);
    Route::get('/reports/matrix', [ReportController::class, 'matrix']);
    Route::get('/reports/export-matrix', [ReportController::class, 'exportMatrix']);
    Route::get('/templates/source-years', [TemplateController::class, 'getSourceYears']);
    Route::apiResource('templates', TemplateController::class)->except(['show', 'update']);
    Route::post('/templates/{template}/apply', [TemplateController::class, 'apply']);
    Route::get('/audit-logs', [AuditLogController::class, 'index']);
    Route::post('/device-token', [NotificationController::class, 'storeDeviceToken']);
    Route::get('/notifications/in-app', [NotificationController::class, 'getInAppNotifications']);
    Route::post('/notifications/mark-as-read', [NotificationController::class, 'markAsRead']);
    Route::apiResource('rencana-aksi.progress', ProgressMonitoringController::class)
        ->only(['index', 'store'])
        ->scoped();
    });
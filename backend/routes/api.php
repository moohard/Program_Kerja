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
    // Rute baru untuk Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);
    // Rute baru untuk Laporan
    Route::get('/reports/monthly', [ReportController::class, 'monthly']);
    Route::get('/reports/matrix', [ReportController::class, 'matrix']); // <-- Rute baru untuk laporan matriks

    Route::apiResource('rencana-aksi.progress', ProgressMonitoringController::class)
        ->only(['index', 'store'])
        ->scoped();
    });
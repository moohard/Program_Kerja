<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\KategoriUtamaController;
use App\Http\Controllers\Api\KegiatanController;
use App\Http\Controllers\Api\RencanaAksiController;
use App\Http\Controllers\Api\TodoItemController;
use App\Http\Controllers\Api\ProgressMonitoringController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\TemplateController;
use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ImportExportController;
use App\Http\Controllers\Api\JabatanController;
use App\Http\Controllers\Api\TodoItemAttachmentController;
use App\Http\Controllers\Api\ProgramKerjaController;

// Rute publik untuk otentikasi
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']); // Asumsi ada, jika tidak bisa dihapus

// Rute yang dilindungi oleh Sanctum
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // API Resources
    Route::apiResource('kategori-utama', KategoriUtamaController::class);
    Route::apiResource('kegiatan', KegiatanController::class);
    Route::apiResource('rencana-aksi', RencanaAksiController::class);
    
    // Nested routes for TodoItems under RencanaAksi
    Route::get('/rencana-aksi/{rencanaAksi}/todo-items', [TodoItemController::class, 'index']);
    Route::post('/rencana-aksi/{rencanaAksi}/todo-items', [TodoItemController::class, 'store']);
    Route::put('/todo-items/{todoItem}', [TodoItemController::class, 'update']);
    Route::delete('/todo-items/{todoItem}', [TodoItemController::class, 'destroy']);

    // Route untuk upload attachment ke to-do item
    Route::post('/todo-items/{todoItem}/attachments', [TodoItemAttachmentController::class, 'store']);

    Route::apiResource('progress-monitoring', ProgressMonitoringController::class);
    Route::apiResource('users', UserController::class);
    Route::apiResource('templates', TemplateController::class);
    Route::apiResource('audit-logs', AuditLogController::class)->only(['index', 'show']);
    Route::apiResource('jabatan', JabatanController::class)->only(['index']);
    Route::apiResource('program-kerja', ProgramKerjaController::class)->only(['index']);

    // Route untuk mengambil progress berdasarkan Rencana Aksi
    Route::get('/rencana-aksi/{rencanaAksi}/progress', [ProgressMonitoringController::class, 'indexByRencanaAksi']);


    // Rute spesifik
    Route::get('/dashboard-stats', [DashboardController::class, 'index']);
    Route::get('/reports/matrix', [ReportController::class, 'matrix']);
    Route::get('/reports/annual-summary', [ReportController::class, 'annualSummary']);
    Route::get('/reports/monthly', [ReportController::class, 'monthly']);
    Route::post('/notifications/device-token', [NotificationController::class, 'storeToken']);

    // Import/Export
    Route::get('/export/rencana-aksi-template', [ImportExportController::class, 'exportRencanaAksiTemplate']);
    Route::post('/import/rencana-aksi', [ImportExportController::class, 'importRencanaAksi']);
});
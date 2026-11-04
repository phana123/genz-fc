<?php

use App\Http\Controllers\Api\ActivityLogController;
use App\Http\Controllers\Api\AnnouncementController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\AttendanceQrController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DisciplineController;
use App\Http\Controllers\Api\PlayerController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\TrainingSessionController;
use App\Http\Controllers\Api\UserAdminController;
use Illuminate\Support\Facades\Route;

Route::get('/', fn () => response()->json(['name' => 'GEN Z FC API', 'version' => '1.0']));
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');

Route::middleware(['auth:sanctum', 'active'])->group(function (): void {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/profile', [AuthController::class, 'updateProfile']);
Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/dashboard', DashboardController::class);
    Route::get('/players', [PlayerController::class, 'index'])->middleware('role:admin,coach,captain,player');
    Route::get('/players/{player}', [PlayerController::class, 'show'])->middleware('role:admin,coach,captain,player');
    Route::post('/players', [PlayerController::class, 'store'])->middleware('role:admin,coach');
    Route::put('/players/{player}', [PlayerController::class, 'update'])->middleware('role:admin,coach');
    Route::delete('/players/{player}', [PlayerController::class, 'destroy'])->middleware('role:admin,coach');
    Route::get('/training-sessions', [TrainingSessionController::class, 'index']);
    Route::get('/training-sessions/{trainingSession}', [TrainingSessionController::class, 'show']);
    Route::post('/training-sessions', [TrainingSessionController::class, 'store'])->middleware('role:admin,coach');
    Route::put('/training-sessions/{trainingSession}', [TrainingSessionController::class, 'update'])->middleware('role:admin,coach');
    Route::delete('/training-sessions/{trainingSession}', [TrainingSessionController::class, 'destroy'])->middleware('role:admin,coach');
    Route::post('/training-sessions/{trainingSession}/qr', [AttendanceQrController::class, 'issue'])->middleware('role:admin,coach,captain');
    Route::get('/attendances', [AttendanceController::class, 'index'])->middleware('role:admin,coach,captain,player');
    Route::post('/attendances/manual', [AttendanceController::class, 'record'])->middleware('role:admin,coach');
    Route::put('/attendances/{attendance}', [AttendanceController::class, 'update'])->middleware('role:admin,coach');
    Route::post('/attendances/check-in', [AttendanceQrController::class, 'checkIn'])->middleware('role:player');
    Route::get('/discipline-records', [DisciplineController::class, 'index'])->middleware('role:admin,coach,captain,player');
    Route::post('/discipline-records', [DisciplineController::class, 'store'])->middleware('role:admin,coach');
    Route::delete('/discipline-records/{disciplineRecord}', [DisciplineController::class, 'destroy'])->middleware('role:admin,coach');
    Route::get('/announcements', [AnnouncementController::class, 'index']);
    Route::post('/announcements', [AnnouncementController::class, 'store'])->middleware('role:admin,coach');
    Route::put('/announcements/{announcement}', [AnnouncementController::class, 'update'])->middleware('role:admin,coach');
    Route::delete('/announcements/{announcement}', [AnnouncementController::class, 'destroy'])->middleware('role:admin,coach');
    Route::get('/reports/attendance', [ReportController::class, 'attendance'])->middleware('role:admin,coach,captain,player');
    Route::get('/users', [UserAdminController::class, 'index'])->middleware('role:admin');
    Route::post('/users', [UserAdminController::class, 'store'])->middleware('role:admin');
    Route::put('/users/{user}', [UserAdminController::class, 'update'])->middleware('role:admin');
    Route::delete('/users/{user}', [UserAdminController::class, 'destroy'])->middleware('role:admin');
    Route::get('/activity-logs', ActivityLogController::class)->middleware('role:admin');
});

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TrainingSession;
use App\Services\ActivityLogger;
use App\Services\QrAttendanceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttendanceQrController extends Controller
{
    public function issue(Request $request, TrainingSession $trainingSession, QrAttendanceService $service, ActivityLogger $logger): JsonResponse
    {
        $data = $request->validate(['valid_minutes' => ['sometimes', 'integer', 'min:1', 'max:20']]);
        $payload = $service->issue($trainingSession, $request->user(), $data['valid_minutes'] ?? 5);
        $logger->record($request, 'attendance.qr_issued', $trainingSession);
        return response()->json($payload);
    }

    public function checkIn(Request $request, QrAttendanceService $service, ActivityLogger $logger): JsonResponse
    {
        $data = $request->validate(['token' => ['required', 'string', 'max:128']]);
        $attendance = $service->checkIn($data['token'], $request->user());
        $logger->record($request, 'attendance.checked_in', $attendance);
        return response()->json(['message' => 'Check-in successful.', 'attendance' => $attendance->load('session')], 201);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\TrainingSession;
use App\Models\User;
use App\Services\ActivityLogger;
use App\Services\AttendanceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AttendanceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Attendance::with(['session:id,title,starts_at,location', 'player:id,name', 'player.playerProfile:user_id,jersey_number,position']);
        if ($request->user()->role === 'player') $query->where('player_id', $request->user()->id);
        if ($request->filled('session_id')) $query->where('training_session_id', $request->integer('session_id'));
        if ($request->filled('month')) {
            $date = now()->parse($request->string('month').'-01');
            $query->whereHas('session', fn ($q) => $q->whereYear('starts_at', $date->year)->whereMonth('starts_at', $date->month));
        }
        if ($request->filled('status')) $query->where('status', $request->string('status'));
        return response()->json($query->orderByDesc('created_at')->paginate(50));
    }

    public function record(Request $request, AttendanceService $service, ActivityLogger $logger): JsonResponse
    {
        $data = $request->validate([
            'training_session_id' => ['required', 'exists:training_sessions,id'],
            'player_id' => ['required', 'exists:users,id'],
            'status' => ['required', Rule::in(['present', 'late', 'absent', 'excused'])],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);
        $player = User::where('role', 'player')->findOrFail($data['player_id']);
        $session = TrainingSession::findOrFail($data['training_session_id']);
        $attendance = $service->record($session, $player, $data['status'], $data['notes'] ?? null, $request->user());
        $logger->record($request, 'attendance.manually_recorded', $attendance, ['status' => $data['status']]);
        return response()->json($attendance->load(['session', 'player.playerProfile']));
    }

    public function update(Request $request, Attendance $attendance, ActivityLogger $logger): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(['present', 'late', 'absent', 'excused'])],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $attendance->update([
            'status' => $data['status'],
            'notes' => $data['notes'] ?? null,
            'checked_in_at' => in_array($data['status'], ['present', 'late'], true) ? ($attendance->checked_in_at ?? now()) : null,
            'recorded_by' => $request->user()->id,
        ]);
        $logger->record($request, 'attendance.updated', $attendance->fresh(), ['status' => $data['status']]);

        return response()->json($attendance->fresh()->load(['session:id,title,starts_at', 'player:id,name', 'player.playerProfile:user_id,jersey_number,position']));
    }
}

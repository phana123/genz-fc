<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\DisciplineRecord;
use App\Models\TrainingSession;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $user = $request->user();
        $isPlayer = $user->role === 'player';
        $playerId = $isPlayer ? $user->id : null;
        $sessions = TrainingSession::query()->whereBetween('starts_at', [now()->startOfMonth(), now()->endOfMonth()])->whereIn('status', ['scheduled', 'completed']);
        $attendances = Attendance::query()->whereHas('session', fn ($query) => $query->whereBetween('starts_at', [now()->startOfMonth(), now()->endOfMonth()]));

        if ($isPlayer) {
            $attendances->where('player_id', $playerId);
        } else {
            $attendances->whereHas('player', fn ($query) => $query->where('is_active', true));
        }

        $activePlayerCount = User::where('role', 'player')->where('is_active', true)->count();
        $attendanceWeek = collect(range(6, 0))->map(function (int $daysBack) use ($isPlayer, $playerId, $activePlayerCount): array {
            $day = now()->subDays($daysBack);
            $daySessions = TrainingSession::whereDate('starts_at', $day->toDateString())->whereIn('status', ['scheduled', 'completed'])->count();
            $attended = Attendance::whereIn('status', ['present', 'late'])
                ->whereHas('session', fn ($query) => $query->whereDate('starts_at', $day->toDateString()))
                ->when($isPlayer, fn ($query) => $query->where('player_id', $playerId), fn ($query) => $query->whereHas('player', fn ($players) => $players->where('is_active', true)))
                ->count();
            $expected = $isPlayer ? $daySessions : $daySessions * max(1, $activePlayerCount);
            return ['day' => $day->format('D'), 'rate' => (int) round($attended / max(1, $expected) * 100)];
        })->values();

        return response()->json([
            'players' => $isPlayer ? 1 : $activePlayerCount,
            'sessions_this_month' => $sessions->count(),
            'attendance_rate' => (int) round((clone $attendances)->whereIn('status', ['present', 'late'])->count() / max(1, $isPlayer ? $sessions->count() : $sessions->count() * max(1, $activePlayerCount)) * 100),
            'attendance_week' => $attendanceWeek,
            'discipline_records' => DisciplineRecord::when($isPlayer, fn ($query) => $query->where('player_id', $playerId))->whereMonth('occurred_at', now()->month)->count(),
            'upcoming_sessions' => TrainingSession::with('creator:id,name')->where('status', 'scheduled')->where('starts_at', '>=', now())->orderBy('starts_at')->limit(5)->get(),
            'recent_attendance' => Attendance::with(['session:id,title,starts_at', 'player:id,name'])->when($isPlayer, fn ($query) => $query->where('player_id', $playerId))->latest('checked_in_at')->limit(6)->get(),
        ]);
    }
}

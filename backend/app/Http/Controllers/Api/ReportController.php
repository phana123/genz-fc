<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\TrainingSession;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function attendance(Request $request): JsonResponse
    {
        $month = $request->validate(['month' => ['sometimes', 'date_format:Y-m']])['month'] ?? now()->format('Y-m');
        [$year, $monthNumber] = array_map('intval', explode('-', $month));
        $sessionIds = TrainingSession::whereYear('starts_at', $year)->whereMonth('starts_at', $monthNumber)->whereIn('status', ['scheduled', 'completed'])->pluck('id');
        $query = Attendance::with(['player:id,name', 'player.playerProfile:user_id,jersey_number,position', 'session:id,title,starts_at'])
            ->whereIn('training_session_id', $sessionIds);
        if ($request->user()->role === 'player') $query->where('player_id', $request->user()->id);

        $records = $query->get();
        $players = User::with('playerProfile:id,user_id,jersey_number,position')->where('role', 'player')->where('is_active', true)
            ->when($request->user()->role === 'player', fn ($query) => $query->whereKey($request->user()->id))->orderBy('name')->get();
        $playerIds = $players->pluck('id');
        $records = $records->whereIn('player_id', $playerIds)->values();
        $counts = $records->countBy('status');
        $byPlayer = $records->groupBy('player_id');
        $rankings = $players->map(function ($player) use ($byPlayer, $sessionIds) {
            $items = $byPlayer->get($player->id, collect());
            $attended = $items->whereIn('status', ['present', 'late'])->count();
            return ['player' => $player, 'attended' => $attended, 'late' => $items->where('status', 'late')->count(), 'rate' => (int) round($attended / max(1, $sessionIds->count()) * 100)];
        })->sortByDesc('attended')->values();
        $expectedAttendance = $sessionIds->count() * $players->count();
        $missingCheckIns = max(0, $expectedAttendance - $records->count());

        return response()->json([
            'month' => $month,
            'sessions' => $sessionIds->count(),
            'summary' => ['present' => $counts->get('present', 0), 'late' => $counts->get('late', 0), 'absent' => $counts->get('absent', 0) + $missingCheckIns, 'excused' => $counts->get('excused', 0)],
            'rankings' => $rankings,
            'records' => $records,
        ]);
    }
}

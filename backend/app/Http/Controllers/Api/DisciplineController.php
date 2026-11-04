<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DisciplineRecord;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DisciplineController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = DisciplineRecord::with(['player:id,name', 'player.playerProfile:user_id,jersey_number', 'recorder:id,name'])->latest('occurred_at');
        if ($request->user()->role === 'player') $query->where('player_id', $request->user()->id);
        elseif ($request->filled('player_id')) $query->where('player_id', $request->integer('player_id'));
        return response()->json($query->paginate(30));
    }

    public function store(Request $request, ActivityLogger $logger): JsonResponse
    {
        $data = $request->validate(['player_id' => ['required', 'exists:users,id'], 'category' => ['required', 'string', 'max:80'], 'description' => ['required', 'string', 'max:4000'], 'points' => ['sometimes', 'integer', 'min:-100', 'max:100'], 'occurred_at' => ['required', 'date']]);
        abort_unless(User::where('role', 'player')->whereKey($data['player_id'])->exists(), 422);
        $record = DisciplineRecord::create([...$data, 'recorded_by' => $request->user()->id]);
        $logger->record($request, 'discipline.created', $record);
        return response()->json($record->load('player:id,name'), 201);
    }

    public function destroy(Request $request, DisciplineRecord $disciplineRecord, ActivityLogger $logger): JsonResponse
    {
        $logger->record($request, 'discipline.deleted', $disciplineRecord);
        $disciplineRecord->delete();
        return response()->json(['message' => 'Discipline record deleted.']);
    }
}

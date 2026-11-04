<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TrainingSession;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TrainingSessionController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(TrainingSession::with('creator:id,name')->withCount('attendances')->orderByDesc('starts_at')->paginate(20));
    }

    public function store(Request $request, ActivityLogger $logger): JsonResponse
    {
        $data = $this->validated($request);
        $session = TrainingSession::create([...$data, 'created_by' => $request->user()->id]);
        $logger->record($request, 'training.created', $session);
        return response()->json($session->load('creator:id,name'), 201);
    }

    public function show(Request $request, TrainingSession $trainingSession): JsonResponse
    {
        $trainingSession->load('creator:id,name');
        if ($request->user()->role === 'player') {
            $trainingSession->load(['attendances' => fn ($query) => $query->where('player_id', $request->user()->id)]);
        } else {
            $trainingSession->load('attendances.player.playerProfile');
        }
        return response()->json($trainingSession);
    }

    public function update(Request $request, TrainingSession $trainingSession, ActivityLogger $logger): JsonResponse
    {
        $trainingSession->update($this->validated($request, $trainingSession));
        $logger->record($request, 'training.updated', $trainingSession);
        return response()->json($trainingSession->fresh()->load('creator:id,name'));
    }

    public function destroy(Request $request, TrainingSession $trainingSession, ActivityLogger $logger): JsonResponse
    {
        $logger->record($request, 'training.deleted', $trainingSession, ['title' => $trainingSession->title]);
        $trainingSession->delete();
        return response()->json(['message' => 'Training session deleted.']);
    }

    private function validated(Request $request, ?TrainingSession $session = null): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:190'],
            'description' => ['nullable', 'string', 'max:5000'],
            'location' => ['required', 'string', 'max:190'],
            'starts_at' => ['required', 'date'],
            'ends_at' => ['nullable', 'date', 'after:starts_at'],
            'status' => ['sometimes', Rule::in(['scheduled', 'completed', 'cancelled'])],
        ]);
    }
}

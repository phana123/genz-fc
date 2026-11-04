<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Announcement::with('creator:id,name')->whereNotNull('published_at')->where('published_at', '<=', now())->latest('published_at')->paginate(20));
    }

    public function store(Request $request, ActivityLogger $logger): JsonResponse
    {
        $data = $request->validate(['title' => ['required', 'string', 'max:190'], 'body' => ['required', 'string', 'max:10000'], 'published_at' => ['nullable', 'date']]);
        $announcement = Announcement::create([...$data, 'published_at' => $data['published_at'] ?? now(), 'created_by' => $request->user()->id]);
        $logger->record($request, 'announcement.created', $announcement);
        return response()->json($announcement->load('creator:id,name'), 201);
    }

    public function update(Request $request, Announcement $announcement, ActivityLogger $logger): JsonResponse
    {
        $announcement->update($request->validate(['title' => ['required', 'string', 'max:190'], 'body' => ['required', 'string', 'max:10000'], 'published_at' => ['nullable', 'date']]));
        $logger->record($request, 'announcement.updated', $announcement);
        return response()->json($announcement->fresh()->load('creator:id,name'));
    }

    public function destroy(Request $request, Announcement $announcement, ActivityLogger $logger): JsonResponse
    {
        $logger->record($request, 'announcement.deleted', $announcement);
        $announcement->delete();
        return response()->json(['message' => 'Announcement deleted.']);
    }
}

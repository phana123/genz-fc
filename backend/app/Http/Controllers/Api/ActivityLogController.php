<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;

class ActivityLogController extends Controller
{
    public function __invoke(): JsonResponse
    {
        return response()->json(ActivityLog::with('user:id,name,role')->latest('created_at')->paginate(50));
    }
}

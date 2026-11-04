<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class ActivityLogger
{
    public function record(Request $request, string $action, ?Model $subject = null, array $metadata = []): void
    {
        ActivityLog::create([
            'user_id' => $request->user()?->id,
            'action' => $action,
            'subject_type' => $subject?->getMorphClass(),
            'subject_id' => $subject?->getKey(),
            'metadata' => $metadata,
            'created_at' => now(),
        ]);
    }
}

<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\TrainingSession;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class AttendanceService
{
    public function record(TrainingSession $session, User $player, string $status, ?string $notes, User $recorder): Attendance
    {
        return DB::transaction(fn () => Attendance::updateOrCreate(
            ['training_session_id' => $session->id, 'player_id' => $player->id],
            ['status' => $status, 'checked_in_at' => in_array($status, ['present', 'late'], true) ? now() : null, 'recorded_by' => $recorder->id, 'notes' => $notes]
        ));
    }
}

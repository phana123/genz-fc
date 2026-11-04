<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\AttendanceQrToken;
use App\Models\TrainingSession;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class QrAttendanceService
{
    public function issue(TrainingSession $session, User $creator, int $minutes): array
    {
        abort_if($session->status !== 'scheduled', 422, 'This session is not open for check-in.');
        abort_if($session->starts_at->gt(now()->addHours(3)), 422, 'QR check-in can be opened shortly before training begins.');
        abort_if($session->ends_at && $session->ends_at->lt(now()), 422, 'This training session has already ended.');
        abort_if($session->starts_at->lt(now()->subHours(4)), 422, 'This training session has already ended.');

        $rawToken = Str::random(64);
        $expiresAt = now()->addMinutes($minutes);
        if ($session->ends_at && $session->ends_at->lt($expiresAt)) {
            $expiresAt = $session->ends_at;
        }

        $token = $session->qrTokens()->create([
            'token_hash' => hash('sha256', $rawToken),
            'expires_at' => $expiresAt,
            'created_by' => $creator->id,
        ]);

        return ['token' => $rawToken, 'expires_at' => $token->expires_at->toIso8601String(), 'session_id' => $session->id];
    }

    public function checkIn(string $rawToken, User $player): Attendance
    {
        $token = AttendanceQrToken::query()
            ->where('token_hash', hash('sha256', $rawToken))
            ->where('expires_at', '>', now())
            ->first();

        if (! $token || $token->session->status !== 'scheduled') {
            throw ValidationException::withMessages(['token' => ['This QR code is invalid or expired.']]);
        }
        if ($token->session->starts_at->gt(now()->addMinutes(30)) || $token->session->starts_at->lt(now()->subHours(4)) || ($token->session->ends_at && $token->session->ends_at->lt(now()))) {
            throw ValidationException::withMessages(['token' => ['Check-in is not available for this session yet.']]);
        }

        return DB::transaction(function () use ($token, $player): Attendance {
            $existing = Attendance::query()
                ->where('training_session_id', $token->training_session_id)
                ->where('player_id', $player->id)
                ->first();

            if ($existing) {
                throw ValidationException::withMessages(['attendance' => ['You have already checked in for this session.']]);
            }

            $session = $token->session;
            $lateAfter = $session->starts_at->copy()->addMinutes(15);

            return Attendance::create([
                'training_session_id' => $session->id,
                'player_id' => $player->id,
                'status' => now()->gt($lateAfter) ? 'late' : 'present',
                'checked_in_at' => now(),
                'recorded_by' => $player->id,
            ]);
        });
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AttendanceQrToken extends Model
{
    protected $fillable = ['training_session_id', 'token_hash', 'expires_at', 'created_by'];

    protected function casts(): array
    {
        return ['expires_at' => 'datetime'];
    }

    public function session()
    {
        return $this->belongsTo(TrainingSession::class, 'training_session_id');
    }
}

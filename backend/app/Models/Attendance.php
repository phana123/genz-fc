<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    protected $fillable = ['training_session_id', 'player_id', 'status', 'checked_in_at', 'recorded_by', 'notes'];

    protected function casts(): array
    {
        return ['checked_in_at' => 'datetime'];
    }

    public function session()
    {
        return $this->belongsTo(TrainingSession::class, 'training_session_id');
    }

    public function player()
    {
        return $this->belongsTo(User::class, 'player_id');
    }
}

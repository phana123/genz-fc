<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DisciplineRecord extends Model
{
    protected $fillable = ['player_id', 'recorded_by', 'category', 'description', 'points', 'occurred_at'];

    protected function casts(): array
    {
        return ['occurred_at' => 'datetime'];
    }

    public function player()
    {
        return $this->belongsTo(User::class, 'player_id');
    }

    public function recorder()
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }
}

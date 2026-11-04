<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TrainingSession extends Model
{
    protected $fillable = ['title', 'description', 'location', 'starts_at', 'ends_at', 'created_by', 'status'];

    protected function casts(): array
    {
        return ['starts_at' => 'datetime', 'ends_at' => 'datetime'];
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }

    public function qrTokens()
    {
        return $this->hasMany(AttendanceQrToken::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}

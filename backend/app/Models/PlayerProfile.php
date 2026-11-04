<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlayerProfile extends Model
{
    protected $fillable = ['user_id', 'jersey_number', 'position', 'phone', 'date_of_birth', 'joined_at', 'status', 'emergency_contact', 'notes', 'role_in_model', 'coach_note', 'photo_path', 'preferred_foot', 'height_cm', 'weight_kg'];

    protected function casts(): array
    {
        return ['date_of_birth' => 'date', 'joined_at' => 'date'];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

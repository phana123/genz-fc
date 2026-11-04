<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = ['name', 'email', 'password', 'role', 'is_active', 'avatar'];

    protected $hidden = ['password', 'remember_token'];

    public function playerProfile()
    {
        return $this->hasOne(PlayerProfile::class);
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class, 'player_id');
    }

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}

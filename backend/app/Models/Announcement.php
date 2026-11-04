<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
    protected $fillable = ['title', 'body', 'published_at', 'created_by'];

    protected function casts(): array
    {
        return ['published_at' => 'datetime'];
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PlayerProfile;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class PlayerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::with('playerProfile')->where('role', 'player')->orderBy('name');
        if ($request->user()->role === 'player') {
            $query->whereKey($request->user()->id);
        }
        if ($request->filled('search')) {
            $search = $request->string('search');
            $query->where(fn ($q) => $q->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%"));
        }
        if ($request->filled('status')) {
            $query->whereHas('playerProfile', fn ($q) => $q->where('status', $request->string('status')));
        }

        return response()->json($query->paginate(20));
    }

    public function store(Request $request, ActivityLogger $logger): JsonResponse
    {
        $data = $this->validated($request);
        if ($request->hasFile('photo')) {
            $data['photo_path'] = $request->file('photo')->store('player_photos', 'public');
        } elseif ($request->boolean('remove_photo')) {
            $data['photo_path'] = null;
        }
        $user = DB::transaction(function () use ($data): User {
            $user = User::create(['name' => $data['name'], 'email' => $data['email'], 'password' => Hash::make($data['password']), 'role' => 'player', 'is_active' => true]);
            $user->playerProfile()->create($this->profileData($data));
            return $user->load('playerProfile');
        });
        $logger->record($request, 'player.created', $user);

        return response()->json($user, 201);
    }

    public function show(Request $request, User $player): JsonResponse
    {
        abort_unless($player->role === 'player', 404);
        abort_if($request->user()->role === 'player' && ! $request->user()->is($player), 403);
        return response()->json($player->load('playerProfile'));
    }

    public function update(Request $request, User $player, ActivityLogger $logger): JsonResponse
    {
        abort_unless($player->role === 'player', 404);
        $data = $this->validated($request, $player);
        if ($request->hasFile('photo')) {
            $data['photo_path'] = $request->file('photo')->store('player_photos', 'public');
        } elseif ($request->boolean('remove_photo')) {
            $data['photo_path'] = null;
        }
        DB::transaction(function () use ($player, $data): void {
            $userData = ['name' => $data['name'], 'email' => $data['email']];
            if (! empty($data['password'])) $userData['password'] = Hash::make($data['password']);
            if (array_key_exists('is_active', $data)) $userData['is_active'] = $data['is_active'];
            $player->update($userData);
            $player->playerProfile()->updateOrCreate(['user_id' => $player->id], $this->profileData($data));
        });
        $logger->record($request, 'player.updated', $player);

        return response()->json($player->fresh()->load('playerProfile'));
    }

    public function destroy(Request $request, User $player, ActivityLogger $logger): JsonResponse
    {
        abort_unless($player->role === 'player', 404);
        $logger->record($request, 'player.deleted', $player, ['name' => $player->name]);
        $player->delete();
        return response()->json(['message' => 'Player deleted.']);
    }

    private function validated(Request $request, ?User $player = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190', Rule::unique('users', 'email')->ignore($player?->id)],
            'password' => [$player ? 'nullable' : 'required', 'string', 'min:8'],
            'is_active' => ['sometimes', 'boolean'],
            'jersey_number' => ['nullable', 'integer', 'min:1', 'max:999', Rule::unique('player_profiles', 'jersey_number')->ignore($player?->playerProfile?->id)],
            'position' => ['nullable', 'string', 'max:40'],
            'phone' => ['nullable', 'string', 'max:30'],
            'date_of_birth' => ['nullable', 'date', 'before:today'],
            'joined_at' => ['nullable', 'date'],
            'status' => ['sometimes', Rule::in(['active', 'injured', 'inactive'])],
            'emergency_contact' => ['nullable', 'string', 'max:120'],
            'notes' => ['nullable', 'string', 'max:5000'],
            'photo' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:2048'],
            'coach_note' => ['nullable', 'string', 'max:5000'],
            'photo_path' => ['nullable', 'string', 'max:255'],
            'preferred_foot' => ['nullable', Rule::in(['Left', 'Right'])],
            'height_cm' => ['nullable', 'integer', 'min:0', 'max:300'],
            'weight_kg' => ['nullable', 'integer', 'min:0', 'max:500'],
            'availability' => ['nullable', 'string', 'max:40'],
            'age' => ['nullable', 'integer', 'min:0', 'max:120'],
        ]);
    }

    private function profileData(array $data): array
    {
        return collect($data)->only(['jersey_number', 'position', 'phone', 'date_of_birth', 'joined_at', 'status', 'emergency_contact', 'notes', 'role_in_model', 'coach_note', 'photo_path', 'preferred_foot', 'height_cm', 'weight_kg'])->all();
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserAdminController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(User::select('id', 'name', 'email', 'role', 'is_active', 'created_at')->orderBy('name')->paginate(30));
    }

    public function store(Request $request, ActivityLogger $logger): JsonResponse
    {
        $data = $request->validate(['name' => ['required', 'string', 'max:120'], 'email' => ['required', 'email', 'max:190', 'unique:users,email'], 'password' => ['required', 'string', 'min:8'], 'role' => ['required', Rule::in(['admin', 'coach', 'captain'])]]);
        $user = User::create([...$data, 'password' => Hash::make($data['password']), 'is_active' => true]);
        $logger->record($request, 'user.created', $user, ['role' => $user->role]);
        return response()->json($user->only('id', 'name', 'email', 'role', 'is_active'), 201);
    }

    public function update(Request $request, User $user, ActivityLogger $logger): JsonResponse
    {
        abort_if($request->user()->is($user), 422, 'You cannot change your own account here.');
        $data = $request->validate(['name' => ['required', 'string', 'max:120'], 'email' => ['required', 'email', 'max:190', Rule::unique('users', 'email')->ignore($user->id)], 'password' => ['nullable', 'string', 'min:8'], 'role' => ['required', Rule::in(['admin', 'coach', 'captain', 'player'])], 'is_active' => ['required', 'boolean']]);
        if ($data['role'] !== 'player' && $user->role === 'player' && ($user->attendances()->exists() || $user->playerProfile()->exists())) abort(422, 'This player has a profile or attendance history and cannot be changed to a staff role.');
        unset($data['password']);
        if ($request->filled('password')) $data['password'] = Hash::make($request->string('password'));
        $user->update($data);
        $logger->record($request, 'user.updated', $user, ['role' => $user->role]);
        return response()->json($user->only('id', 'name', 'email', 'role', 'is_active'));
    }

    public function destroy(Request $request, User $user, ActivityLogger $logger): JsonResponse
    {
        abort_if($request->user()->is($user), 422, 'You cannot delete your own account.');
        $logger->record($request, 'user.deactivated', $user);
        $user->update(['is_active' => false]);
        $user->tokens()->delete();
        return response()->json(['message' => 'Account deactivated.']);
    }
}

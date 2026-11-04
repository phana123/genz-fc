<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $data = $request->validate(['email' => ['required', 'email'], 'password' => ['required', 'string']]);
        $user = \App\Models\User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password) || ! $user->is_active) {
            throw ValidationException::withMessages(['email' => ['The email or password is incorrect.']]);
        }

        Auth::guard('web')->login($user);
        $request->session()->regenerate();

        return response()->json(['user' => $user->load('playerProfile')]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json($request->user()->load('playerProfile'));
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190', Rule::unique('users', 'email')->ignore($user->id)],
            'current_password' => ['required_with:password', 'current_password:web'],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
            'avatar' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:2048'],
        ]);

        $user->name = $data['name'];
        $user->email = $data['email'];
        if (! empty($data['password'])) {
            $user->password = Hash::make($data['password']);
        }
        if ($request->hasFile('avatar')) {
            $user->avatar = $request->file('avatar')->store('avatars', 'public');
        }
        $user->save();

        return response()->json($user->load('playerProfile'));
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Signed out successfully.']);
    }
}

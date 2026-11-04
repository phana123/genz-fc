<?php

use Illuminate\Support\Facades\Route;

Route::get('/', fn () => response()->json(['name' => 'GEN Z FC Management API', 'status' => 'ready', 'docs' => '/api']));

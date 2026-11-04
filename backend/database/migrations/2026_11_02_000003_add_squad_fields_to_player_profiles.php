<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('player_profiles', function (Blueprint $table): void {
            $table->string('preferred_foot', 10)->nullable()->after('position');
            $table->unsignedSmallInteger('height_cm')->nullable()->after('preferred_foot');
            $table->unsignedSmallInteger('weight_kg')->nullable()->after('height_cm');
            $table->string('role_in_model', 80)->nullable()->after('weight_kg');
            $table->text('coach_note')->nullable()->after('role_in_model');
            $table->string('photo_path', 255)->nullable()->after('coach_note');
        });
    }

    public function down(): void
    {
        Schema::table('player_profiles', function (Blueprint $table): void {
            $table->dropColumn(['preferred_foot', 'height_cm', 'weight_kg', 'role_in_model', 'coach_note', 'photo_path']);
        });
    }
};
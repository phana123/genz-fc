<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('player_profiles', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('jersey_number')->nullable()->unique();
            $table->string('position', 40)->nullable();
            $table->string('phone', 30)->nullable();
            $table->date('date_of_birth')->nullable();
            $table->date('joined_at')->nullable();
            $table->enum('status', ['active', 'injured', 'inactive'])->default('active')->index();
            $table->string('emergency_contact', 120)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('training_sessions', function (Blueprint $table): void {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('location');
            $table->dateTime('starts_at')->index();
            $table->dateTime('ends_at')->nullable();
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->enum('status', ['scheduled', 'completed', 'cancelled'])->default('scheduled')->index();
            $table->timestamps();
        });

        Schema::create('attendance_qr_tokens', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('training_session_id')->constrained()->cascadeOnDelete();
            $table->char('token_hash', 64)->unique();
            $table->dateTime('expires_at')->index();
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->timestamps();
        });

        Schema::create('attendances', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('training_session_id')->constrained()->cascadeOnDelete();
            $table->foreignId('player_id')->constrained('users')->cascadeOnDelete();
            $table->enum('status', ['present', 'late', 'absent', 'excused'])->default('present')->index();
            $table->dateTime('checked_in_at')->nullable();
            $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->unique(['training_session_id', 'player_id']);
        });

        Schema::create('announcements', function (Blueprint $table): void {
            $table->id();
            $table->string('title');
            $table->longText('body');
            $table->dateTime('published_at')->nullable()->index();
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->timestamps();
        });

        Schema::create('discipline_records', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('player_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('recorded_by')->constrained('users')->restrictOnDelete();
            $table->string('category', 80)->index();
            $table->text('description');
            $table->smallInteger('points')->default(0);
            $table->dateTime('occurred_at')->index();
            $table->timestamps();
        });

        Schema::create('activity_logs', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action', 120)->index();
            $table->string('subject_type')->nullable();
            $table->unsignedBigInteger('subject_id')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('created_at')->useCurrent()->index();
            $table->index(['subject_type', 'subject_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
        Schema::dropIfExists('discipline_records');
        Schema::dropIfExists('announcements');
        Schema::dropIfExists('attendances');
        Schema::dropIfExists('attendance_qr_tokens');
        Schema::dropIfExists('training_sessions');
        Schema::dropIfExists('player_profiles');
    }
};

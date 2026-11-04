-- GEN Z FC Management System
-- MySQL 8.0+. You may import this schema OR run `php artisan migrate`, not both.
CREATE DATABASE IF NOT EXISTS genz_fc_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE genz_fc_management;

CREATE TABLE users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  email_verified_at TIMESTAMP NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin','coach','captain','player') NOT NULL DEFAULT 'player',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  remember_token VARCHAR(100) NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  PRIMARY KEY (id), UNIQUE KEY users_email_unique (email), KEY users_role_index (role), KEY users_is_active_index (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE password_reset_tokens (
  email VARCHAR(255) NOT NULL,
  token VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NULL,
  PRIMARY KEY (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE personal_access_tokens (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  tokenable_type VARCHAR(255) NOT NULL,
  tokenable_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(255) NOT NULL,
  token VARCHAR(64) NOT NULL,
  abilities TEXT NULL,
  last_used_at TIMESTAMP NULL,
  expires_at TIMESTAMP NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  PRIMARY KEY (id), UNIQUE KEY personal_access_tokens_token_unique (token), KEY personal_access_tokens_tokenable_index (tokenable_type, tokenable_id), KEY personal_access_tokens_expires_at_index (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE player_profiles (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  jersey_number SMALLINT UNSIGNED NULL,
  position VARCHAR(40) NULL,
  phone VARCHAR(30) NULL,
  date_of_birth DATE NULL,
  joined_at DATE NULL,
  status ENUM('active','injured','inactive') NOT NULL DEFAULT 'active',
  emergency_contact VARCHAR(120) NULL,
  notes TEXT NULL,
  role_in_model VARCHAR(80) NULL,
  coach_note TEXT NULL,
  photo_path VARCHAR(255) NULL,
  preferred_foot ENUM('Left','Right') NULL,
  height_cm SMALLINT UNSIGNED NULL,
  weight_kg SMALLINT UNSIGNED NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  PRIMARY KEY (id), UNIQUE KEY player_profiles_user_unique (user_id), UNIQUE KEY player_profiles_jersey_unique (jersey_number), KEY player_profiles_status_index (status),
  CONSTRAINT player_profiles_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE training_sessions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  location VARCHAR(255) NOT NULL,
  starts_at DATETIME NOT NULL,
  ends_at DATETIME NULL,
  created_by BIGINT UNSIGNED NOT NULL,
  status ENUM('scheduled','completed','cancelled') NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  PRIMARY KEY (id), KEY training_sessions_starts_at_index (starts_at), KEY training_sessions_status_index (status),
  CONSTRAINT training_sessions_creator_fk FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE attendance_qr_tokens (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  training_session_id BIGINT UNSIGNED NOT NULL,
  token_hash CHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_by BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  PRIMARY KEY (id), UNIQUE KEY attendance_qr_token_hash_unique (token_hash), KEY attendance_qr_expires_index (expires_at),
  CONSTRAINT attendance_qr_session_fk FOREIGN KEY (training_session_id) REFERENCES training_sessions(id) ON DELETE CASCADE,
  CONSTRAINT attendance_qr_creator_fk FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE attendances (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  training_session_id BIGINT UNSIGNED NOT NULL,
  player_id BIGINT UNSIGNED NOT NULL,
  status ENUM('present','late','absent','excused') NOT NULL DEFAULT 'present',
  checked_in_at DATETIME NULL,
  recorded_by BIGINT UNSIGNED NULL,
  notes TEXT NULL,
  role_in_model VARCHAR(80) NULL,
  coach_note TEXT NULL,
  photo_path VARCHAR(255) NULL,
  preferred_foot ENUM('Left','Right') NULL,
  height_cm SMALLINT UNSIGNED NULL,
  weight_kg SMALLINT UNSIGNED NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  PRIMARY KEY (id), UNIQUE KEY attendances_session_player_unique (training_session_id, player_id), KEY attendances_status_index (status),
  CONSTRAINT attendances_session_fk FOREIGN KEY (training_session_id) REFERENCES training_sessions(id) ON DELETE CASCADE,
  CONSTRAINT attendances_player_fk FOREIGN KEY (player_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT attendances_recorder_fk FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE announcements (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  body LONGTEXT NOT NULL,
  published_at DATETIME NULL,
  created_by BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  PRIMARY KEY (id), KEY announcements_published_index (published_at),
  CONSTRAINT announcements_creator_fk FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE discipline_records (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  player_id BIGINT UNSIGNED NOT NULL,
  recorded_by BIGINT UNSIGNED NOT NULL,
  category VARCHAR(80) NOT NULL,
  description TEXT NOT NULL,
  points SMALLINT NOT NULL DEFAULT 0,
  occurred_at DATETIME NOT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  PRIMARY KEY (id), KEY discipline_category_index (category), KEY discipline_occurred_at_index (occurred_at),
  CONSTRAINT discipline_player_fk FOREIGN KEY (player_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT discipline_recorder_fk FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE activity_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NULL,
  action VARCHAR(120) NOT NULL,
  subject_type VARCHAR(255) NULL,
  subject_id BIGINT UNSIGNED NULL,
  metadata JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id), KEY activity_logs_action_index (action), KEY activity_logs_created_at_index (created_at), KEY activity_logs_subject_index (subject_type, subject_id),
  CONSTRAINT activity_logs_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

# GEN Z FC Management System

A bilingual (Khmer / English) football club management website with a Laravel 12 REST API and a separate React application.

## Stack

- `backend/`: Laravel 12, Sanctum session authentication, MySQL 8
- `frontend/`: React 18, Vite, custom dark navy / electric blue / magenta UI, Lucide icons
- QR check-in: expiring, hashed server-side tokens; QR generation and browser camera scanning

## WAMP setup

1. Start Apache and MySQL from Wampserver. Open phpMyAdmin and create a database named `genz_fc_management` with `utf8mb4_unicode_ci`, or import [`database/genz_fc_schema.sql`](database/genz_fc_schema.sql). **Choose one database setup path**: importing the SQL creates the tables, so do not run migrations afterward.
2. Set `DB_USERNAME` / `DB_PASSWORD` in `backend/.env`. The provided local `.env` is configured for WAMP's `root` account with password `123456`; `.env.example` contains an empty password. Use `localhost` for the API and frontend addresses so the first-party session cookie is shared correctly.
3. In a terminal, install backend dependencies and prepare the database:

   ```powershell
   cd backend
   $env:Path = 'C:\wamp64\bin\php\php8.3.28;' + $env:Path
   & 'C:\ProgramData\ComposerSetup\bin\composer.bat' install
   if (!(Test-Path .env)) { Copy-Item .env.example .env }
   & 'C:\wamp64\bin\php\php8.3.28\php.exe' artisan key:generate
   & 'C:\wamp64\bin\php\php8.3.28\php.exe' artisan migrate --seed   # empty database only
   ```

   If you imported the SQL schema, run `& 'C:\wamp64\bin\php\php8.3.28\php.exe' artisan db:seed` instead of `migrate --seed`.
4. In a second terminal, start the React app:

   ```powershell
   cd frontend
   if (!(Test-Path .env)) { Copy-Item .env.example .env }
   npm.cmd install
   npm.cmd run dev
   ```

5. Open `http://localhost:5173`. The Laravel API runs at `http://localhost:8000/api`.

## Local development accounts

The idempotent database seeder creates these accounts. Change the administrator password in `backend/.env` before seeding if desired. Demo credentials are for local development only.

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@genzfc.com` | `genzFC@123` |
| Coach | `coach@genzfc.local` | `Coach123!` |
| Captain | `captain@genzfc.local` | `Captain123!` |
| Player | `sokha@genzfc.local` | `Player123!` |

## Features

- Role-aware admin, coach, captain, and player access
- Khmer and English interface switch
- Player roster and profile management
- Training calendar management and expiring QR generation
- QR check-in for players and manual attendance recording by staff
- Present, late, absent, and excused attendance records
- Monthly attendance reports, rankings, and charts
- Discipline records, announcements, account management, and activity history

The SPA uses Sanctum's CSRF-protected session cookie authentication. QR secrets are stored as SHA-256 hashes. A player can only check in to a session once, attendance is unique per player and session, and player accounts cannot edit attendance. Staff roles are checked on every protected API route. QR scanning uses the browser QR detector and requires camera permission in a supported browser on localhost or HTTPS.

## Project layout

```text
backend/   Laravel API, migrations, seeders, services
frontend/  React/Vite web client, bilingual locales, pages and components
database/  Importable MySQL schema
```

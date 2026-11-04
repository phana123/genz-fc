<?php

use Illuminate\Support\Facades\Artisan;

Artisan::command('about-app', function () {
    $this->comment('Web Genz Laravel application is ready for development.');
})->purpose('Display a short description of this application');

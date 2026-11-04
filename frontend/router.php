<?php

$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$dist = __DIR__.'/dist';

if (is_file($dist.'/index.html')) {
    $asset = realpath($dist.$path);
    $root = realpath($dist);
    if ($asset && $root && str_starts_with($asset, $root.DIRECTORY_SEPARATOR) && is_file($asset)) {
        $mime = function_exists('mime_content_type') ? mime_content_type($asset) : false;
        if ($mime) header('Content-Type: '.$mime);
        readfile($asset);
        return true;
    }
    readfile($dist.'/index.html');
    return true;
}

if ($path === '/' || $path === '/login') {
    readfile(__DIR__.'/login-fallback.html');
    return true;
}

if ($path === '/dashboard') {
    readfile(__DIR__.'/dashboard-fallback.html');
    return true;
}

if ($path === '/favicon.ico') {
    http_response_code(204);
    return true;
}

http_response_code(404);
echo 'Not found';

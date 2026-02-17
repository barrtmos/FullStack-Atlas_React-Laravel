<?php

use Illuminate\Support\Facades\Artisan;

Artisan::command('trace:clear', function () {
    cache()->flush();
    $this->comment('Trace cache cleared.');
});

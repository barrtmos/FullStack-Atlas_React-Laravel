<?php

use App\Http\Middleware\AuthenticateApiToken;
use App\Http\Middleware\TraceContext;
use App\Services\TraceStore;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'auth.token' => AuthenticateApiToken::class,
            'trace.context' => TraceContext::class,
        ]);

        $middleware->appendToGroup('api', TraceContext::class);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->report(function (\Throwable $e) {
            $traceId = request()?->attributes->get('trace_id') ?? request()?->header('X-Trace-Id');

            app(TraceStore::class)->append($traceId, [
                'type' => 'error',
                'message' => $e->getMessage(),
                'class' => $e::class,
                'stack_preview' => collect(explode("\n", $e->getTraceAsString()))->take(10)->values()->all(),
                'timestamp' => now()->toISOString(),
            ]);
        });
    })->create();

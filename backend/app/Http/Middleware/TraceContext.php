<?php

namespace App\Http\Middleware;

use App\Services\TraceStore;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TraceContext
{
    public function __construct(private readonly TraceStore $traceStore)
    {
    }

    public function handle(Request $request, Closure $next)
    {
        $startedAt = microtime(true);
        $traceId = $this->traceStore->ensureTraceId($request->header('X-Trace-Id'));

        $request->attributes->set('trace_id', $traceId);

        $route = $request->route();
        $this->traceStore->append($traceId, [
            'type' => 'request_received',
            'method' => $request->method(),
            'path' => $request->path(),
            'route_name' => $route?->getName(),
            'controller' => $route?->getActionName(),
            'middleware' => $route?->gatherMiddleware() ?? [],
            'start_time' => now()->toISOString(),
        ]);

        $response = $next($request);

        $durationMs = (microtime(true) - $startedAt) * 1000;
        $content = method_exists($response, 'getContent') ? (string) $response->getContent() : '';
        $preview = mb_substr($content, 0, 2048);

        $this->traceStore->append($traceId, [
            'type' => 'response_sent',
            'status' => method_exists($response, 'getStatusCode') ? $response->getStatusCode() : 200,
            'duration' => round($durationMs, 2),
            'response_size' => strlen($content),
            'body_preview' => $preview,
        ]);

        $summary = $this->traceStore->summary($traceId);

        $response->headers->set('X-Trace-Id', $traceId);
        $response->headers->set('X-Trace-Summary', base64_encode(json_encode($summary)));

        if ($response instanceof JsonResponse) {
            $data = $response->getData(true);
            $data['_trace'] = [
                'trace_id' => $traceId,
                'backend_summary' => $summary,
            ];
            $response->setData($data);
        }

        return $response;
    }
}

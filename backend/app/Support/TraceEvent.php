<?php

namespace App\Support;

class TraceEvent
{
    public static function make(array $event, string $traceId, int $sequence): array
    {
        return array_merge([
            'trace_id' => $traceId,
            'sequence' => $sequence,
            'timestamp' => now()->toISOString(),
        ], $event);
    }
}

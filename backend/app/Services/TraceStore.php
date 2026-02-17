<?php

namespace App\Services;

use App\Support\TraceEvent;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class TraceStore
{
    private const TTL_SECONDS = 3600;

    public function ensureTraceId(?string $traceId): string
    {
        return $traceId && $traceId !== '' ? $traceId : (string) Str::uuid();
    }

    public function append(?string $traceId, array $event): array
    {
        $id = $this->ensureTraceId($traceId);
        $key = $this->eventsKey($id);
        $events = Cache::get($key, []);

        $sequence = count($events) + 1;
        $normalized = TraceEvent::make($event, $id, $sequence);
        $events[] = $normalized;

        Cache::put($key, $events, self::TTL_SECONDS);
        Cache::put($this->metaKey($id), [
            'trace_id' => $id,
            'total_events' => count($events),
            'updated_at' => now()->toISOString(),
        ], self::TTL_SECONDS);

        return $normalized;
    }

    public function getEvents(string $traceId): array
    {
        return Cache::get($this->eventsKey($traceId), []);
    }

    public function getEventsAfter(string $traceId, int $lastSequence): array
    {
        return array_values(array_filter(
            $this->getEvents($traceId),
            fn (array $event) => ($event['sequence'] ?? 0) > $lastSequence
        ));
    }

    public function summary(string $traceId): array
    {
        $events = $this->getEvents($traceId);

        return [
            'trace_id' => $traceId,
            'event_count' => count($events),
            'types' => array_values(array_unique(array_map(
                fn (array $event) => $event['type'] ?? 'unknown',
                $events
            ))),
        ];
    }

    private function eventsKey(string $traceId): string
    {
        return 'trace:events:'.$traceId;
    }

    private function metaKey(string $traceId): string
    {
        return 'trace:meta:'.$traceId;
    }
}

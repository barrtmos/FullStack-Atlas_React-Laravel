<?php

namespace App\Http\Controllers;

use App\Services\TraceStore;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class TraceController extends Controller
{
    public function __construct(private readonly TraceStore $traceStore)
    {
    }

    public function show(string $id)
    {
        return response()->json([
            'trace_id' => $id,
            'events' => $this->traceStore->getEvents($id),
        ]);
    }

    public function stream(Request $request): StreamedResponse
    {
        $traceId = $request->query('trace_id');
        $lastSequence = (int) $request->query('last_sequence', 0);

        return response()->stream(function () use ($traceId, $lastSequence) {
            $cursor = $lastSequence;
            $ticks = 0;

            while ($ticks < 30) {
                $events = $this->traceStore->getEventsAfter($traceId, $cursor);

                foreach ($events as $event) {
                    $cursor = max($cursor, $event['sequence'] ?? $cursor);
                    echo "event: trace\n";
                    echo 'data: '.json_encode($event)."\n\n";
                }

                echo ": ping\n\n";
                @ob_flush();
                @flush();

                usleep(500000);
                $ticks++;
            }
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'Connection' => 'keep-alive',
            'X-Accel-Buffering' => 'no',
        ]);
    }
}

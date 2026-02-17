<?php

namespace App\Providers;

use App\Services\TraceStore;
use Illuminate\Database\Events\QueryExecuted;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(TraceStore::class, fn () => new TraceStore());
    }

    public function boot(): void
    {
        $traceStore = $this->app->make(TraceStore::class);

        $this->app['db']->listen(function (QueryExecuted $query) use ($traceStore) {
            $traceId = request()?->attributes->get('trace_id');

            if (! $traceId) {
                return;
            }

            $sql = $query->sql;
            foreach ($query->bindings as $binding) {
                $replacement = is_numeric($binding)
                    ? (string) $binding
                    : "'".str_replace("'", "''", (string) $binding)."'";
                $sql = preg_replace('/\?/', $replacement, $sql, 1);
            }

            $traceStore->append($traceId, [
                'type' => 'query_executed',
                'sql' => $sql,
                'duration' => $query->time,
                'connection' => $query->connectionName,
            ]);
        });
    }
}

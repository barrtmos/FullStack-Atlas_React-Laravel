import { useMemo } from 'react';
import { useTraceStore } from '@/features/trace/store';

const eventKey = (traceId: string, sequence: number) => `${traceId}:${sequence}`;

export const TraceDevTools = () => {
  const state = useTraceStore();
  const { traces, activeTraceId, selectedKey, filters } = state;

  const events = traces[activeTraceId] ?? [];

  const filtered = useMemo(() => {
    return events.filter((event) => {
      if (filters.traceId && event.trace_id !== filters.traceId) return false;
      if (filters.eventType && event.type !== filters.eventType) return false;
      if (filters.endpoint && !JSON.stringify(event).includes(filters.endpoint)) return false;
      if (filters.component && !JSON.stringify(event).includes(filters.component)) return false;
      if (filters.search && !JSON.stringify(event).toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
  }, [events, filters]);

  const selected = filtered.find((event) => eventKey(event.trace_id, event.sequence) === selectedKey) ?? filtered[0];

  if (!state.panelOpen) {
    return null;
  }

  return (
    <aside className="trace-panel">
      <div className="trace-header">
        <strong>Панель трекинга</strong>
        <div className="row wrap trace-active-line">
          <span className="muted">Активный trace:</span>
          <span className="badge">{activeTraceId || 'нет trace'}</span>
        </div>
      </div>

      <div className="trace-filters grid-2">
        <input placeholder="trace id" value={filters.traceId} onChange={(e) => state.updateFilters({ traceId: e.target.value })} />
        <input placeholder="тип события" value={filters.eventType} onChange={(e) => state.updateFilters({ eventType: e.target.value })} />
        <input placeholder="endpoint" value={filters.endpoint} onChange={(e) => state.updateFilters({ endpoint: e.target.value })} />
        <input placeholder="component" value={filters.component} onChange={(e) => state.updateFilters({ component: e.target.value })} />
        <input placeholder="поиск по payload" value={filters.search} onChange={(e) => state.updateFilters({ search: e.target.value })} />
      </div>

      <div className="trace-list">
        {filtered.map((event) => {
          const key = eventKey(event.trace_id, event.sequence);
          return (
            <div key={key} className={`trace-item ${selectedKey === key ? 'active' : ''}`} onClick={() => state.selectEvent(key)}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <strong>{event.sequence}. {event.type}</strong>
                <span className="muted">{new Date(event.timestamp).toLocaleTimeString()}</span>
              </div>
              <div className="muted">{String(event.method || event.path || event.component || event.sql || '')}</div>
            </div>
          );
        })}
      </div>

      <div className="trace-detail">
        <div className="trace-detail-frame">
          <strong>Детали</strong>
          <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{JSON.stringify(selected ?? {}, null, 2)}</pre>
        </div>
      </div>
    </aside>
  );
};

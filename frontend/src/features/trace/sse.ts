import { useTraceStore } from './store';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000';

export const ensureTraceStream = (traceId: string) => {
  const state = useTraceStore.getState();
  if (!traceId || state.sseMap[traceId]) {
    return;
  }

  const source = new EventSource(`${API_URL}/api/trace/stream?trace_id=${encodeURIComponent(traceId)}`);
  source.addEventListener('trace', (raw) => {
    const data = JSON.parse((raw as MessageEvent).data) as Record<string, unknown>;
    const sequence = typeof data.sequence === 'number' ? data.sequence : Number(data.sequence ?? 0);
    const timestamp = typeof data.timestamp === 'string' ? data.timestamp : new Date().toISOString();
    const type = typeof data.type === 'string' ? data.type : 'backend_event';
    useTraceStore.getState().pushEvent({
      ...data,
      trace_id: traceId,
      type,
      sequence,
      timestamp,
    });
  });

  source.onerror = () => {
    source.close();
    useTraceStore.getState().detachSSE(traceId);
  };

  useTraceStore.getState().attachSSE(traceId, source);
};

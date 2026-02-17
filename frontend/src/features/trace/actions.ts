import { ensureTraceStream } from './sse';
import { useTraceStore } from './store';

export const startTrace = (action: string, target?: string) => {
  const traceId = useTraceStore.getState().startTrace(action, target);
  ensureTraceStream(traceId);
  return traceId;
};

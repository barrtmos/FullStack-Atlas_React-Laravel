import { create } from 'zustand';
import { TraceEvent, TraceFilters } from './types';

const initialFilters: TraceFilters = {
  traceId: '',
  eventType: '',
  endpoint: '',
  component: '',
  search: '',
};

type TraceState = {
  traces: Record<string, TraceEvent[]>;
  activeTraceId: string;
  selectedKey: string;
  panelOpen: boolean;
  filters: TraceFilters;
  sseMap: Record<string, EventSource>;
  nextSequence: Record<string, number>;
  startTrace: (action: string, target?: string) => string;
  pushEvent: (event: {
    trace_id: string;
    type: string;
    sequence?: number;
    timestamp?: string;
    [key: string]: unknown;
  }) => void;
  setActiveTrace: (traceId: string) => void;
  selectEvent: (key: string) => void;
  setPanelOpen: (open: boolean) => void;
  updateFilters: (patch: Partial<TraceFilters>) => void;
  attachSSE: (traceId: string, source: EventSource) => void;
  detachSSE: (traceId: string) => void;
};

const nowIso = () => new Date().toISOString();
const makeId = () => (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));

export const useTraceStore = create<TraceState>((set, get) => ({
  traces: {},
  activeTraceId: '',
  selectedKey: '',
  panelOpen: true,
  filters: initialFilters,
  sseMap: {},
  nextSequence: {},
  startTrace: (action, target = 'unknown') => {
    const traceId = makeId();
    set((state) => ({
      activeTraceId: traceId,
      nextSequence: { ...state.nextSequence, [traceId]: 1 },
    }));

    get().pushEvent({
      trace_id: traceId,
      type: 'ui_event',
      action,
      target,
      ui_type: action,
    });

    return traceId;
  },
  pushEvent: (event) => {
    set((state) => {
      const traceId = event.trace_id;
      const existing = state.traces[traceId] ?? [];
      const seq = event.sequence ?? (state.nextSequence[traceId] ?? 1);

      const normalized: TraceEvent = {
        ...event,
        trace_id: traceId,
        sequence: seq,
        timestamp: event.timestamp ?? nowIso(),
      };

      return {
        traces: {
          ...state.traces,
          [traceId]: [...existing, normalized].sort((a, b) => a.sequence - b.sequence),
        },
        nextSequence: {
          ...state.nextSequence,
          [traceId]: Math.max(state.nextSequence[traceId] ?? 1, seq + 1),
        },
      };
    });
  },
  setActiveTrace: (traceId) => set({ activeTraceId: traceId, filters: { ...get().filters, traceId } }),
  selectEvent: (key) => set({ selectedKey: key }),
  setPanelOpen: (open) => set({ panelOpen: open }),
  updateFilters: (patch) => set((state) => ({ filters: { ...state.filters, ...patch } })),
  attachSSE: (traceId, source) => set((state) => ({ sseMap: { ...state.sseMap, [traceId]: source } })),
  detachSSE: (traceId) => {
    const source = get().sseMap[traceId];
    if (source) {
      source.close();
    }
    set((state) => {
      const next = { ...state.sseMap };
      delete next[traceId];
      return { sseMap: next };
    });
  },
}));

export const getActiveTraceId = () => useTraceStore.getState().activeTraceId;

import { getActiveTraceId, useTraceStore } from './store';

type RenderBucket = {
  traceId: string;
  component: string;
  phase: string;
  rendersCount: number;
  totalDuration: number;
  maxDuration: number;
  startedAt: number;
  lastAt: number;
  timer: ReturnType<typeof setTimeout> | null;
};

type InputBucket = {
  traceId: string;
  field: string;
  from: string;
  to: string;
  keystrokesCount: number;
  startedAt: number;
  lastAt: number;
};

const RENDER_WINDOW_MS = 3000;

const renderBuckets = new Map<string, RenderBucket>();
const inputBuckets = new Map<string, InputBucket>();

const renderKey = (traceId: string, component: string, phase: string) => `${traceId}:${component}:${phase}`;
const inputKey = (traceId: string, field: string) => `${traceId}:${field}`;

const pushEvent = (event: Record<string, unknown>) => {
  useTraceStore.getState().pushEvent(event as never);
};

const flushRenderBucket = (key: string) => {
  const bucket = renderBuckets.get(key);
  if (!bucket) return;

  if (bucket.timer) {
    clearTimeout(bucket.timer);
  }

  const durationMs = Math.max(0, Math.round(bucket.lastAt - bucket.startedAt));

  // Keep only meaningful render batches.
  if (bucket.phase === 'update' && bucket.rendersCount < 4) {
    renderBuckets.delete(key);
    return;
  }

  pushEvent({
    trace_id: bucket.traceId,
    type: 'react_render_batch',
    component: bucket.component,
    phase: bucket.phase,
    renders_count: bucket.rendersCount,
    total_duration: Number(bucket.totalDuration.toFixed(2)),
    max_duration: Number(bucket.maxDuration.toFixed(2)),
    window_ms: durationMs,
  });

  renderBuckets.delete(key);
};

export const recordReactRender = (component: string, phase: string, actualDuration: number) => {
  const traceId = getActiveTraceId();
  if (!traceId) return;

  const key = renderKey(traceId, component, phase);
  const now = performance.now();
  const current = renderBuckets.get(key);

  if (!current) {
    const bucket: RenderBucket = {
      traceId,
      component,
      phase,
      rendersCount: 1,
      totalDuration: actualDuration,
      maxDuration: actualDuration,
      startedAt: now,
      lastAt: now,
      timer: null,
    };

    bucket.timer = setTimeout(() => flushRenderBucket(key), RENDER_WINDOW_MS);
    renderBuckets.set(key, bucket);
    return;
  }

  current.rendersCount += 1;
  current.totalDuration += actualDuration;
  current.maxDuration = Math.max(current.maxDuration, actualDuration);
  current.lastAt = now;

  if (current.timer) {
    clearTimeout(current.timer);
  }
  current.timer = setTimeout(() => flushRenderBucket(key), RENDER_WINDOW_MS);
};

const flushInputBucket = (key: string) => {
  const bucket = inputBuckets.get(key);
  if (!bucket) return;

  const durationMs = Math.max(0, Math.round(bucket.lastAt - bucket.startedAt));
  const from = bucket.from;
  const to = bucket.to;

  pushEvent({
    trace_id: bucket.traceId,
    type: 'input_batch',
    action: 'input_batch',
    target: bucket.field,
    payload: {
      field: bucket.field,
      from,
      to,
      chars_count: Math.abs(to.length - from.length),
      keystrokes_count: bucket.keystrokesCount,
      duration_ms: durationMs,
    },
  });

  inputBuckets.delete(key);
};

export const recordInputChange = (field: string, from: string, to: string) => {
  const traceId = getActiveTraceId();
  if (!traceId || from === to) return;

  const key = inputKey(traceId, field);
  const now = performance.now();
  const current = inputBuckets.get(key);

  if (!current) {
    const bucket: InputBucket = {
      traceId,
      field,
      from,
      to,
      keystrokesCount: 1,
      startedAt: now,
      lastAt: now,
    };
    inputBuckets.set(key, bucket);
    return;
  }

  current.to = to;
  current.keystrokesCount += 1;
  current.lastAt = now;
};

export const flushInputField = (field: string) => {
  const traceId = getActiveTraceId();
  if (!traceId) return;

  flushInputBucket(inputKey(traceId, field));
};

export const flushAllInputBatches = () => {
  const keys = [...inputBuckets.keys()];
  keys.forEach((key) => flushInputBucket(key));
};

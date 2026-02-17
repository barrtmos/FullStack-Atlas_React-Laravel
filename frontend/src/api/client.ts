import axios from 'axios';
import { getActiveTraceId, useTraceStore } from '@/features/trace/store';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

const bodyPreview = (body: unknown) => {
  if (!body) return '';
  const text = typeof body === 'string' ? body : JSON.stringify(body);
  return text.slice(0, 2048);
};

api.interceptors.request.use((config) => {
  const traceId = getActiveTraceId();
  const headersRaw = typeof config.headers?.toJSON === 'function'
    ? config.headers.toJSON()
    : (config.headers as Record<string, unknown> | undefined) ?? {};
  const safeHeaders = Object.fromEntries(
    Object.entries(headersRaw).filter(([key]) => !/cookie/i.test(key)),
  );

  if (traceId) {
    config.headers.set('X-Trace-Id', traceId);
    useTraceStore.getState().pushEvent({
      trace_id: traceId,
      type: 'api_request',
      method: config.method?.toUpperCase(),
      url: `${config.baseURL}${config.url}`,
      headers: safeHeaders,
      body_preview: bodyPreview(config.data),
    });
  }

  (config as typeof config & { meta?: { startedAt: number } }).meta = { startedAt: performance.now() };

  return config;
});

api.interceptors.response.use(
  (response) => {
    const traceId = response.headers['x-trace-id'] ?? getActiveTraceId();
    const startedAt = (response.config as typeof response.config & { meta?: { startedAt: number } }).meta?.startedAt ?? performance.now();

    if (traceId) {
      useTraceStore.getState().pushEvent({
        trace_id: traceId,
        type: 'api_response',
        status: response.status,
        duration: Number((performance.now() - startedAt).toFixed(2)),
        body_preview: bodyPreview(response.data),
      });

      const summary = response.data?._trace?.backend_summary;
      if (summary) {
        useTraceStore.getState().pushEvent({
          trace_id: traceId,
          type: 'response_sent',
          source: 'summary',
          ...summary,
        });
      }
    }

    return response;
  },
  (error) => {
    const traceId = error.response?.headers?.['x-trace-id'] ?? getActiveTraceId();
    if (traceId) {
      useTraceStore.getState().pushEvent({
        trace_id: traceId,
        type: 'error',
        message: error.message,
        status: error.response?.status,
      });
    }
    return Promise.reject(error);
  },
);

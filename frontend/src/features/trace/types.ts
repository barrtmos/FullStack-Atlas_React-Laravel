export type TraceEventType =
  | 'ui_event'
  | 'input_batch'
  | 'api_request'
  | 'api_response'
  | 'react_render'
  | 'react_render_batch'
  | 'request_received'
  | 'query_executed'
  | 'response_sent'
  | 'error';

export type TraceEvent = {
  trace_id: string;
  sequence: number;
  timestamp: string;
  type: TraceEventType | string;
  [key: string]: unknown;
};

export type TraceFilters = {
  traceId: string;
  eventType: string;
  endpoint: string;
  component: string;
  search: string;
};

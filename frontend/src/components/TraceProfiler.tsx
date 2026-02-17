import { Profiler, ReactNode } from 'react';
import { useTraceStore } from '@/features/trace/store';

type Props = {
  component: string;
  children: ReactNode;
};

let isRecordingRender = false;

export const TraceProfiler = ({ component, children }: Props) => {
  return (
    <Profiler
      id={component}
      onRender={(_, phase, actualDuration) => {
        // Guard against feedback loop:
        // writing react_render into the trace store triggers another render,
        // which would recursively trigger Profiler again.
        if (isRecordingRender) return;

        const traceId = useTraceStore.getState().activeTraceId;
        if (!traceId) return;

        isRecordingRender = true;
        useTraceStore.getState().pushEvent({
          trace_id: traceId,
          type: 'react_render',
          component,
          phase,
          duration: Number(actualDuration.toFixed(2)),
        });
        queueMicrotask(() => {
          isRecordingRender = false;
        });
      }}
    >
      {children}
    </Profiler>
  );
};

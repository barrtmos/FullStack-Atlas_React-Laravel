import { Profiler, ReactNode } from 'react';
import { recordReactRender } from '@/features/trace/batching';

type Props = {
  component: string;
  children: ReactNode;
};

export const TraceProfiler = ({ component, children }: Props) => {
  return (
    <Profiler
      id={component}
      onRender={(_, phase, actualDuration) => {
        recordReactRender(component, phase, Number(actualDuration.toFixed(2)));
      }}
    >
      {children}
    </Profiler>
  );
};

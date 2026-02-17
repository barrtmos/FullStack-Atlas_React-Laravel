import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from '@/router/AppRouter';
import { TraceDevTools } from '@/components/TraceDevTools';
import { ArchitectureMap } from '@/components/ArchitectureMap';
import { applyAuthHeader } from '@/features/auth/api';
import { useTraceStore } from '@/features/trace/store';

export default function App() {
  const setPanelOpen = useTraceStore((s) => s.setPanelOpen);

  useEffect(() => {
    applyAuthHeader();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === '`') {
        useTraceStore.setState((state) => ({ panelOpen: !state.panelOpen }));
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [setPanelOpen]);

  return (
    <BrowserRouter>
      <div className="app-shell">
        <main className="main-area">
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
            <h1 style={{ margin: 0 }}>Песочница + Режим объяснения</h1>
            <small className="muted">Переключить панель: Ctrl + `</small>
          </div>
          <ArchitectureMap />
          <AppRouter />
        </main>
        <TraceDevTools />
      </div>
    </BrowserRouter>
  );
}

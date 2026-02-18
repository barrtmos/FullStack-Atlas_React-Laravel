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
      if (event.ctrlKey && (event.key === '/' || event.code === 'Slash')) {
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
          <div className="row app-topbar" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
            <div className="logo-frame" aria-label="Trace Sandbox">
              <img className="app-logo" src="/logo.png" alt="Trace Sandbox" />
              <span className="logo-vignette" aria-hidden />
            </div>
            <small className="muted">Панель трекинга: Ctrl + /</small>
          </div>
          <ArchitectureMap />
          <div className="route-area">
            <AppRouter />
          </div>
        </main>
        <TraceDevTools />
      </div>
    </BrowserRouter>
  );
}

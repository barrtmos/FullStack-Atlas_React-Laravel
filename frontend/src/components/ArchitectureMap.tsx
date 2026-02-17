import { useMemo } from 'react';
import { useTraceStore } from '@/features/trace/store';

type Node = {
  id: string;
  label: string;
  type: 'component' | 'endpoint' | 'controller' | 'table';
  x: number;
  y: number;
  file: string;
};

type Edge = { from: string; to: string };

const nodes: Node[] = [
  { id: 'page.posts', label: 'PostsList', type: 'component', x: 40, y: 40, file: 'frontend/src/pages/PostsListPage.tsx' },
  { id: 'page.postform', label: 'PostForm', type: 'component', x: 40, y: 130, file: 'frontend/src/pages/PostFormPage.tsx' },
  { id: 'api.posts', label: 'GET /api/posts', type: 'endpoint', x: 270, y: 40, file: 'backend/routes/api.php' },
  { id: 'api.postStore', label: 'POST /api/posts', type: 'endpoint', x: 270, y: 130, file: 'backend/routes/api.php' },
  { id: 'ctl.posts', label: 'PostController', type: 'controller', x: 500, y: 85, file: 'backend/app/Http/Controllers/PostController.php' },
  { id: 'tbl.posts', label: 'posts table', type: 'table', x: 730, y: 85, file: 'backend/database/migrations/2026_01_01_000002_create_posts_table.php' },
];

const edges: Edge[] = [
  { from: 'page.posts', to: 'api.posts' },
  { from: 'page.postform', to: 'api.postStore' },
  { from: 'api.posts', to: 'ctl.posts' },
  { from: 'api.postStore', to: 'ctl.posts' },
  { from: 'ctl.posts', to: 'tbl.posts' },
];

const isActiveNode = (node: Node, eventDump: string) => {
  const keys = [node.label, node.id, node.file, '/api/posts', 'PostController', 'posts'];
  return keys.some((key) => eventDump.toLowerCase().includes(key.toLowerCase()));
};

const EMPTY_EVENTS: unknown[] = [];

export const ArchitectureMap = () => {
  const activeTraceId = useTraceStore((s) => s.activeTraceId);
  const activeEvents = useTraceStore((s) => s.traces[s.activeTraceId] ?? EMPTY_EVENTS);

  const eventDump = useMemo(() => JSON.stringify(activeEvents), [activeEvents]);

  return (
    <div className="arch-map card">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <strong>Карта архитектуры</strong>
        <span className="muted">Активный trace: {activeTraceId || 'нет'}</span>
      </div>
      <svg viewBox="0 0 950 220" width="100%" height="220">
        {edges.map((edge) => {
          const from = nodes.find((node) => node.id === edge.from);
          const to = nodes.find((node) => node.id === edge.to);
          if (!from || !to) return null;
          return <line key={`${edge.from}-${edge.to}`} x1={from.x + 120} y1={from.y + 20} x2={to.x} y2={to.y + 20} stroke="#b8b3a4" strokeWidth="2" />;
        })}

        {nodes.map((node) => {
          const active = isActiveNode(node, eventDump);
          const fill = active ? '#d4ebfb' : '#fff';
          const stroke = active ? '#1b6ca8' : '#cfc9b7';

          return (
            <g key={node.id}>
              <rect x={node.x} y={node.y} width="200" height="48" rx="8" fill={fill} stroke={stroke} />
              <text x={node.x + 10} y={node.y + 20} style={{ fontWeight: 600, fontSize: 13 }}>{node.label}</text>
              <text x={node.x + 10} y={node.y + 36} style={{ fontSize: 11, fill: '#6d6d6d' }}>{node.file}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

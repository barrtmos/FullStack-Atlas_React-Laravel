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
const NODE_WIDTH = 210;
const NODE_HEIGHT = 62;
const NODE_CENTER_Y = NODE_HEIGHT / 2;

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
const truncate = (value: string, limit: number) => (value.length > limit ? `${value.slice(0, limit - 1)}...` : value);

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
      <svg viewBox="0 0 980 220" width="100%" height="220">
        {edges.map((edge) => {
          const from = nodes.find((node) => node.id === edge.from);
          const to = nodes.find((node) => node.id === edge.to);
          if (!from || !to) return null;
          return <line key={`${edge.from}-${edge.to}`} x1={from.x + (NODE_WIDTH * 0.6)} y1={from.y + NODE_CENTER_Y} x2={to.x} y2={to.y + NODE_CENTER_Y} stroke="#b8b3a4" strokeWidth="2" />;
        })}

        {nodes.map((node) => {
          const active = isActiveNode(node, eventDump);
          const fill = active ? '#d4ebfb' : '#fff';
          const stroke = active ? '#1b6ca8' : '#cfc9b7';
          const clipId = `node-clip-${node.id.replace(/[^a-zA-Z0-9_-]/g, '-')}`;

          return (
            <g key={node.id}>
              <rect x={node.x} y={node.y} width={NODE_WIDTH} height={NODE_HEIGHT} rx="8" fill={fill} stroke={stroke} />
              <clipPath id={clipId}>
                <rect x={node.x + 6} y={node.y + 3} width={NODE_WIDTH - 12} height={NODE_HEIGHT - 6} rx="4" />
              </clipPath>
              <title>{`${node.label}\n${node.file}`}</title>
              <text x={node.x + 10} y={node.y + 24} clipPath={`url(#${clipId})`} style={{ fontWeight: 700, fontSize: 20 }}>{truncate(node.label, 22)}</text>
              <text x={node.x + 10} y={node.y + 48} clipPath={`url(#${clipId})`} style={{ fontSize: 16, fill: '#6d6d6d' }}>{truncate(node.file, 23)}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

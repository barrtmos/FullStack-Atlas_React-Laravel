import { useMemo } from 'react';
import { useTraceStore } from '@/features/trace/store';
import { useLocation } from 'react-router-dom';

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

const EMPTY_EVENTS: unknown[] = [];
const truncate = (value: string, limit: number) => (value.length > limit ? `${value.slice(0, limit - 1)}...` : value);

const toText = (value: unknown) => String(value ?? '').toLowerCase();

const buildActiveNodeSet = (pathname: string, events: unknown[]): Set<string> => {
  const active = new Set<string>();
  const path = pathname.toLowerCase();

  // Route-level highlighting for the current screen.
  if (path.startsWith('/posts')) {
    active.add('page.posts');
  }
  if (path.includes('/create') || path.includes('/edit')) {
    active.add('page.postform');
  }

  for (const raw of events) {
    const event = (raw ?? {}) as Record<string, unknown>;
    const type = toText(event.type);
    const method = toText(event.method);
    const url = toText(event.url);
    const requestPath = toText(event.path);
    const controller = toText(event.controller);
    const sql = toText(event.sql);
    const target = toText(event.target);
    const action = toText(event.action);

    if (target.includes('post') || action.includes('post')) {
      active.add('page.posts');
    }

    if (target.includes('create') || target.includes('edit') || action.includes('create') || action.includes('edit')) {
      active.add('page.postform');
    }

    if (url.includes('/api/posts') || requestPath.includes('/api/posts') || requestPath === 'api/posts') {
      if (method === 'post') {
        active.add('api.postStore');
      } else {
        active.add('api.posts');
      }
    }

    if (controller.includes('postcontroller')) {
      active.add('ctl.posts');
    }

    if (sql.includes('posts')) {
      active.add('tbl.posts');
    }

    // Backend request_received might not carry method in some edge events.
    if (type === 'request_received' && requestPath.includes('posts')) {
      active.add('api.posts');
      active.add('ctl.posts');
    }
  }

  return active;
};

export const ArchitectureMap = () => {
  const activeEvents = useTraceStore((s) => s.traces[s.activeTraceId] ?? EMPTY_EVENTS);
  const location = useLocation();

  const activeNodes = useMemo(
    () => buildActiveNodeSet(location.pathname, activeEvents),
    [location.pathname, activeEvents],
  );

  return (
    <div className="arch-map card">
      <div className="row">
        <strong>Карта архитектуры</strong>
      </div>
      <svg viewBox="0 0 980 220" width="100%" height="154">
        <defs>
          <filter id="nodeGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {edges.map((edge) => {
          const from = nodes.find((node) => node.id === edge.from);
          const to = nodes.find((node) => node.id === edge.to);
          if (!from || !to) return null;
          return <line key={`${edge.from}-${edge.to}`} x1={from.x + (NODE_WIDTH * 0.6)} y1={from.y + NODE_CENTER_Y} x2={to.x} y2={to.y + NODE_CENTER_Y} stroke="#b8b3a4" strokeWidth="2" />;
        })}

        {nodes.map((node) => {
          const active = activeNodes.has(node.id);
          const fill = active ? '#59d7ff' : '#fff';
          const stroke = active ? '#00eeff' : '#cfc9b7';
          const titleColor = active ? '#001628' : '#111';
          const subColor = active ? '#003c67' : '#6d6d6d';
          const clipId = `node-clip-${node.id.replace(/[^a-zA-Z0-9_-]/g, '-')}`;

          return (
            <g key={node.id}>
              <rect
                x={node.x}
                y={node.y}
                width={NODE_WIDTH}
                height={NODE_HEIGHT}
                rx="8"
                fill={fill}
                stroke={stroke}
                strokeWidth={active ? 2.5 : 1}
                filter={active ? 'url(#nodeGlow)' : undefined}
              />
              <clipPath id={clipId}>
                <rect x={node.x + 6} y={node.y + 3} width={NODE_WIDTH - 12} height={NODE_HEIGHT - 6} rx="4" />
              </clipPath>
              <title>{`${node.label}\n${node.file}`}</title>
              <text x={node.x + 10} y={node.y + 24} clipPath={`url(#${clipId})`} style={{ fontWeight: 700, fontSize: 20, fill: titleColor }}>{truncate(node.label, 22)}</text>
              <text x={node.x + 10} y={node.y + 48} clipPath={`url(#${clipId})`} style={{ fontSize: 16, fill: subColor }}>{truncate(node.file, 23)}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

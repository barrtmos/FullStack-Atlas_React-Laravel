import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { deletePost, fetchPosts, Post } from '@/features/posts/api';
import { logout } from '@/features/auth/api';
import { startTrace } from '@/features/trace/actions';

const statusLabel: Record<Post['status'], string> = {
  draft: 'черновик',
  published: 'опубликован',
  archived: 'архив',
};

export const PostsListPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  const load = async (nextPage = page, nextSearch = search, nextStatus = status) => {
    const traceId = startTrace('navigation', 'posts-list-load');
    const result = await fetchPosts({ page: nextPage, search: nextSearch, status: nextStatus });
    setPosts(result.data);
    setPage(result.current_page);
    setLastPage(result.last_page);
    return traceId;
  };

  useEffect(() => {
    void load(1, '', '');
  }, []);

  const onDelete = async (id: number) => {
    startTrace('click', `delete-post-${id}`);
    await deletePost(String(id));
    await load();
  };

  const onLogout = async () => {
    startTrace('click', 'logout-button');
    await logout();
    navigate('/login');
  };

  return (
    <div className="card">
      <div className="top-nav">
        <h2 style={{ margin: 0 }}>Посты</h2>
        <Link to="/posts/create"><button>Создать</button></Link>
        <button className="secondary" onClick={onLogout}>Выйти</button>
      </div>

      <div className="row wrap" style={{ marginBottom: 10 }}>
        <input
          placeholder="поиск по заголовку"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onBlur={() => void load(1, search, status)}
        />
        <select value={status} onChange={(e) => { setStatus(e.target.value); void load(1, search, e.target.value); }}>
          <option value="">все статусы</option>
          <option value="draft">черновик</option>
          <option value="published">опубликован</option>
          <option value="archived">архив</option>
        </select>
      </div>

      <table className="posts-table">
        <thead>
          <tr><th>ID</th><th>Заголовок</th><th>Статус</th><th>Действия</th></tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post.id}>
              <td>{post.id}</td>
              <td><Link to={`/posts/${post.id}`}>{post.title}</Link></td>
              <td>{statusLabel[post.status]}</td>
              <td className="row">
                <Link to={`/posts/${post.id}/edit`}><button className="secondary">Изменить</button></Link>
                <button className="danger" onClick={() => void onDelete(post.id)}>Удалить</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="row" style={{ marginTop: 10 }}>
        <button className="secondary" disabled={page <= 1} onClick={() => void load(page - 1)}>Назад</button>
        <span className="muted">Страница {page} / {lastPage}</span>
        <button className="secondary" disabled={page >= lastPage} onClick={() => void load(page + 1)}>Вперёд</button>
      </div>
    </div>
  );
};

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchPost, Post } from '@/features/posts/api';
import { startTrace } from '@/features/trace/actions';

const statusLabel: Record<Post['status'], string> = {
  draft: 'черновик',
  published: 'опубликован',
  archived: 'архив',
};

export const PostDetailPage = () => {
  const { id = '' } = useParams();
  const [post, setPost] = useState<Post | null>(null);

  useEffect(() => {
    const run = async () => {
      startTrace('navigation', `post-detail-${id}`);
      const loaded = await fetchPost(id);
      setPost(loaded);
    };
    void run();
  }, [id]);

  if (!post) return <div className="card">Загрузка...</div>;

  return (
    <div className="card">
      <h2>{post.title}</h2>
      <p className="muted">Статус: {statusLabel[post.status]}</p>
      <p>{post.body}</p>
      <div className="row">
        <Link to={`/posts/${post.id}/edit`}><button>Изменить</button></Link>
        <Link to="/posts"><button className="secondary">Назад</button></Link>
      </div>
    </div>
  );
};

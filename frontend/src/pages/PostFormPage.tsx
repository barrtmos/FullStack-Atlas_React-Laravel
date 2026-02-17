import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createPost, fetchPost, updatePost } from '@/features/posts/api';
import { startTrace } from '@/features/trace/actions';

export const PostFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('draft');
  const navigate = useNavigate();

  useEffect(() => {
    if (!isEdit) return;

    const run = async () => {
      startTrace('navigation', `post-edit-${id}`);
      const post = await fetchPost(id || '');
      setTitle(post.title);
      setBody(post.body);
      setStatus(post.status);
    };

    void run();
  }, [id, isEdit]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    startTrace('submit', isEdit ? `update-post-${id}` : 'create-post');

    if (isEdit) {
      await updatePost(id || '', { title, body, status });
    } else {
      await createPost({ title, body, status });
    }

    navigate('/posts');
  };

  return (
    <div className="card">
      <h2>{isEdit ? 'Редактировать пост' : 'Создать пост'}</h2>
      <form className="form-grid" onSubmit={onSubmit}>
        <input placeholder="Заголовок" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea rows={8} placeholder="Текст" value={body} onChange={(e) => setBody(e.target.value)} />
        <select value={status} onChange={(e) => setStatus(e.target.value as 'draft' | 'published' | 'archived')}>
          <option value="draft">черновик</option>
          <option value="published">опубликован</option>
          <option value="archived">архив</option>
        </select>
        <div className="row">
          <button type="submit">Сохранить</button>
          <button type="button" className="secondary" onClick={() => navigate('/posts')}>Отмена</button>
        </div>
      </form>
    </div>
  );
};

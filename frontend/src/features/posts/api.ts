import { api } from '@/api/client';

export type Post = {
  id: number;
  title: string;
  body: string;
  status: 'draft' | 'published' | 'archived';
  user_id: number;
  created_at: string;
};

export type PostPage = {
  data: Post[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

export const fetchPosts = async (params: { search: string; status: string; page: number }) => {
  const { data } = await api.get<PostPage>('/posts', { params });
  return data;
};

export const fetchPost = async (id: string) => {
  const { data } = await api.get<{ post: Post }>(`/posts/${id}`);
  return data.post;
};

export const createPost = async (payload: Pick<Post, 'title' | 'body' | 'status'>) => {
  const { data } = await api.post<{ post: Post }>('/posts', payload);
  return data.post;
};

export const updatePost = async (id: string, payload: Pick<Post, 'title' | 'body' | 'status'>) => {
  const { data } = await api.put<{ post: Post }>(`/posts/${id}`, payload);
  return data.post;
};

export const deletePost = async (id: string) => {
  await api.delete(`/posts/${id}`);
};

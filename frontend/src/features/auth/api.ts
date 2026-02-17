import { api } from '@/api/client';
import { useAuthStore } from './authStore';

export const applyAuthHeader = () => {
  const token = useAuthStore.getState().token;
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

export const register = async (payload: { name: string; email: string; password: string }) => {
  const { data } = await api.post('/auth/register', payload);
  useAuthStore.getState().setAuth(data.token, data.user);
  applyAuthHeader();
  return data;
};

export const login = async (payload: { email: string; password: string }) => {
  const { data } = await api.post('/auth/login', payload);
  useAuthStore.getState().setAuth(data.token, data.user);
  applyAuthHeader();
  return data;
};

export const logout = async () => {
  await api.post('/auth/logout');
  useAuthStore.getState().clearAuth();
  applyAuthHeader();
};

export const me = async () => {
  const { data } = await api.get('/auth/me');
  return data.user;
};

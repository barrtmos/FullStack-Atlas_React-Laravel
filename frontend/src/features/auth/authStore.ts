import { create } from 'zustand';

type User = { id: number; name: string; email: string };

type AuthState = {
  token: string;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
};

const savedToken = localStorage.getItem('token') ?? '';
const savedUser = localStorage.getItem('user');

export const useAuthStore = create<AuthState>((set) => ({
  token: savedToken,
  user: savedUser ? (JSON.parse(savedUser) as User) : null,
  setAuth: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ token, user });
  },
  clearAuth: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: '', user: null });
  },
}));

export type { User };

import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '@/features/auth/api';
import { startTrace } from '@/features/trace/actions';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    startTrace('submit', 'login-form');
    try {
      await login({ email, password });
      navigate('/posts');
    } catch {
      setError('Ошибка входа');
    }
  };

  return (
    <div className="card">
      <h2>Вход</h2>
      <form className="form-grid" onSubmit={onSubmit}>
        <input placeholder="Почта" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="Пароль" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit" className="login-button">Войти</button>
      </form>
      {error ? <p className="muted">{error}</p> : null}
      <p className="muted">Нет аккаунта? <Link className="auth-link" to="/register">Регистрация</Link></p>
    </div>
  );
};

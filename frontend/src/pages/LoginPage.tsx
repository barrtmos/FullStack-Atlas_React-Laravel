import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { login } from '@/features/auth/api';
import { startTrace } from '@/features/trace/actions';
import { flushAllInputBatches, flushInputField, recordInputChange } from '@/features/trace/batching';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    flushAllInputBatches();
    startTrace('submit', 'login-form');
    try {
      await login({ email, password });
      navigate('/posts');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const details = err.response?.data?.message;
        if (typeof details === 'string' && details.trim() !== '') {
          setError(details);
          return;
        }
      }
      setError('Ошибка входа');
    }
  };

  return (
    <div className="card auth-card">
      <h2>Вход</h2>
      <form className="form-grid" onSubmit={onSubmit}>
        <input
          placeholder="Почта"
          value={email}
          onChange={(e) => {
            recordInputChange('login.email', email, e.target.value);
            setEmail(e.target.value);
          }}
          onBlur={() => flushInputField('login.email')}
        />
        <input
          placeholder="Пароль"
          type="password"
          value={password}
          onChange={(e) => {
            recordInputChange('login.password', password, e.target.value);
            setPassword(e.target.value);
          }}
          onBlur={() => flushInputField('login.password')}
        />
        <button type="submit" className="login-button">Войти</button>
      </form>
      {error ? <p className="muted">{error}</p> : null}
      <p className="muted auth-hint">Нет аккаунта? <Link className="auth-link" to="/register">Регистрация</Link></p>
    </div>
  );
};

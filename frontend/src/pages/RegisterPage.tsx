import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '@/features/auth/api';
import { startTrace } from '@/features/trace/actions';

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    startTrace('submit', 'register-form');
    try {
      await register({ name, email, password });
      navigate('/posts');
    } catch {
      setError('Ошибка регистрации');
    }
  };

  return (
    <div className="card">
      <h2>Регистрация</h2>
      <form className="form-grid" onSubmit={onSubmit}>
        <input placeholder="Имя" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="Почта" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="Пароль" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Создать аккаунт</button>
      </form>
      {error ? <p className="muted">{error}</p> : null}
      <p className="muted">Уже есть аккаунт? <Link to="/login">Войти</Link></p>
    </div>
  );
};

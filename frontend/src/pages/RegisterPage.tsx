import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '@/features/auth/api';
import { startTrace } from '@/features/trace/actions';
import { flushAllInputBatches, flushInputField, recordInputChange } from '@/features/trace/batching';

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    flushAllInputBatches();
    startTrace('submit', 'register-form');
    try {
      await register({ name, email, password });
      navigate('/posts');
    } catch {
      setError('Ошибка регистрации');
    }
  };

  return (
    <div className="card auth-card">
      <h2>Регистрация</h2>
      <form className="form-grid" onSubmit={onSubmit}>
        <input
          placeholder="Имя"
          value={name}
          onChange={(e) => {
            recordInputChange('register.name', name, e.target.value);
            setName(e.target.value);
          }}
          onBlur={() => flushInputField('register.name')}
        />
        <input
          placeholder="Почта"
          value={email}
          onChange={(e) => {
            recordInputChange('register.email', email, e.target.value);
            setEmail(e.target.value);
          }}
          onBlur={() => flushInputField('register.email')}
        />
        <input
          placeholder="Пароль"
          type="password"
          value={password}
          onChange={(e) => {
            recordInputChange('register.password', password, e.target.value);
            setPassword(e.target.value);
          }}
          onBlur={() => flushInputField('register.password')}
        />
        <button type="submit">Создать аккаунт</button>
      </form>
      {error ? <p className="muted">{error}</p> : null}
      <p className="muted auth-hint">Уже есть аккаунт? <Link to="/login">Войти</Link></p>
    </div>
  );
};

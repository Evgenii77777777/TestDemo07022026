import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';


// API функция
const api = {
    login: (data) => fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => res.json())
};



// Вход
const LoginPage = () => {
  const [form, setForm] = useState({ login: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await api.login(form);
    if (result.success) {
      localStorage.setItem('user', JSON.stringify(result.user));
      window.location.href = result.isAdmin ? '/admin' : '/orders';
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="auth-page">
      <h2>Вход</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Логин" value={form.login}
          onChange={e => setForm({...form, login: e.target.value})} />
        <input type="password" placeholder="Пароль" value={form.password}
          onChange={e => setForm({...form, password: e.target.value})} />
        {error && <div className="error">{error}</div>}
        <button type="submit">Войти</button>
      </form>
      <Link to="/register">Нет аккаунта? Зарегистрируйтесь</Link>
      <Link to="/">Назад</Link>
    </div>
  );
};

export default LoginPage;
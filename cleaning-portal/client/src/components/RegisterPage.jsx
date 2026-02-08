import React, { useState } from 'react';
import { Link  , useNavigate } from 'react-router-dom';

  // API функции
  const api = {
    register: (data) => fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => res.json())
  };

// Регистрация
const RegisterPage = () => {
  const [form, setForm] = useState({ login: '', password: '', full_name: '', phone: '', email: '' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!form.login) newErrors.login = 'Обязательное поле';
    if (form.password.length < 6) newErrors.password = 'Минимум 6 символов';
    if (!/^[А-Яа-яёЁ\s]+$/.test(form.full_name)) newErrors.full_name = 'Только кириллица и пробелы';
    if (!/^\+7\(\d{3}\)-\d{3}-\d{2}-\d{2}$/.test(form.phone)) newErrors.phone = 'Формат: +7(XXX)-XXX-XX-XX';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Неверный формат email';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const result = await api.register(form);
    if (result.success) {
      alert('Регистрация успешна!');
      window.location.href = '/login';
    } else {
      setErrors({ submit: result.error });
    }
  };

  return (
    <div className="auth-page">
      <h2>Регистрация</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Логин" value={form.login} 
          onChange={e => setForm({...form, login: e.target.value})} />
        {errors.login && <span className="error">{errors.login}</span>}
        
        <input type="password" placeholder="Пароль" value={form.password}
          onChange={e => setForm({...form, password: e.target.value})} />
        {errors.password && <span className="error">{errors.password}</span>}
        
        <input type="text" placeholder="ФИО" value={form.full_name}
          onChange={e => setForm({...form, full_name: e.target.value})} />
        {errors.full_name && <span className="error">{errors.full_name}</span>}
        
        <input type="text" placeholder="Телефон" value={form.phone}
          onChange={e => setForm({...form, phone: e.target.value})} />
        {errors.phone && <span className="error">{errors.phone}</span>}
        
        <input type="email" placeholder="Email" value={form.email}
          onChange={e => setForm({...form, email: e.target.value})} />
        {errors.email && <span className="error">{errors.email}</span>}
        
        {errors.submit && <div className="error">{errors.submit}</div>}
        
        <button type="submit">Зарегистрироваться</button>
      </form>
      <Link to="/login">Уже есть аккаунт? Войти</Link>
      <Link to="/">Назад</Link>
    </div>
  );
};

export default RegisterPage;
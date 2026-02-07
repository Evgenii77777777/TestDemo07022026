import React, { useState } from 'react';

const Register = ({ onRegister, onSwitchToLogin, apiBase }) => {
  const [formData, setFormData] = useState({
    login: '',
    password: '',
    fullName: '',
    phone: '',
    email: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const newErrors = {};
    
    if (!formData.login.trim()) {
      newErrors.login = 'Введите логин';
    } else if (formData.login.length < 3) {
      newErrors.login = 'Логин должен содержать минимум 3 символа';
    }
    
    if (!formData.password) {
      newErrors.password = 'Введите пароль';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль должен содержать минимум 6 символов';
    }
    
    const nameRegex = /^[А-Яа-яЁё\s]+$/;
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Введите ФИО';
    } else if (!nameRegex.test(formData.fullName)) {
      newErrors.fullName = 'ФИО должно содержать только кириллические символы и пробелы';
    }
    
    const phoneRegex = /^\+7\(\d{3}\)-\d{3}-\d{2}-\d{2}$/;
    if (!formData.phone) {
      newErrors.phone = 'Введите номер телефона';
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Телефон должен быть в формате +7(XXX)-XXX-XX-XX';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Введите email';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Введите корректный email';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    try {
      const response = await fetch(`${apiBase}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          login: formData.login,
          password: formData.password,
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess(true);
        // Автоматический вход после регистрации
        const loginResponse = await fetch(`${apiBase}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            login: formData.login,
            password: formData.password
          })
        });
        
        const loginData = await loginResponse.json();
        if (loginData.success) {
          onRegister(loginData.user);
        }
      } else {
        setErrors(data.errors || { general: 'Ошибка регистрации' });
      }
    } catch (error) {
      setErrors({ general: 'Ошибка соединения с сервером' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setErrors({
      ...errors,
      [e.target.name]: ''
    });
  };

  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, '');
    let formatted = '+7(';
    
    if (numbers.length > 1) {
      formatted += numbers.substring(1, 4);
    }
    if (numbers.length >= 4) {
      formatted += ')-' + numbers.substring(4, 7);
    }
    if (numbers.length >= 7) {
      formatted += '-' + numbers.substring(7, 9);
    }
    if (numbers.length >= 9) {
      formatted += '-' + numbers.substring(9, 11);
    }
    
    return formatted;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value);
    setFormData({
      ...formData,
      phone: formatted
    });
    setErrors({
      ...errors,
      phone: ''
    });
  };

  return (
    <div className="auth-container">
      <div className="form-header">
        <h2>Регистрация</h2>
        <p>Создайте аккаунт для оформления заявок</p>
      </div>
      
      {success && (
        <div className="success-message">
          <i className="fas fa-check-circle"></i>
          Регистрация успешна! Выполняется вход...
        </div>
      )}
      
      {errors.general && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          {errors.general}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="login">Логин:*</label>
          <input
            type="text"
            id="login"
            name="login"
            value={formData.login}
            onChange={handleChange}
            className="form-control"
            placeholder="Придумайте логин (мин. 3 символа)"
          />
          {errors.login && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              {errors.login}
            </div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Пароль:*</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="form-control"
            placeholder="Придумайте пароль (мин. 6 символов)"
          />
          {errors.password && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              {errors.password}
            </div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="fullName">ФИО:*</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="form-control"
            placeholder="Иванов Иван Иванович"
          />
          {errors.fullName && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              {errors.fullName}
            </div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="phone">Телефон:*</label>
          <input
            type="text"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handlePhoneChange}
            className="form-control"
            placeholder="+7(XXX)-XXX-XX-XX"
          />
          {errors.phone && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              {errors.phone}
            </div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email:*</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="form-control"
            placeholder="example@mail.ru"
          />
          {errors.email && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              {errors.email}
            </div>
          )}
        </div>
        
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Регистрация...
              </>
            ) : (
              <>
                <i className="fas fa-user-plus"></i> Зарегистрироваться
              </>
            )}
          </button>
        </div>
      </form>
      
      <div className="switch-form">
        <span>Уже есть аккаунт?</span>
        <button type="button" onClick={onSwitchToLogin}>
          Войдите
        </button>
      </div>
    </div>
  );
};

export default Register;
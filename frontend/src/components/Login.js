import React, { useState } from 'react';

const Login = ({ onLogin, onSwitchToRegister, apiBase }) => {
  const [formData, setFormData] = useState({
    login: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    
    if (!formData.login.trim()) {
      newErrors.login = 'Введите логин';
    }
    
    if (!formData.password) {
      newErrors.password = 'Введите пароль';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль должен содержать минимум 6 символов';
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
      const response = await fetch(`${apiBase}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        onLogin(data.user);
      } else {
        setErrors(data.errors || { general: 'Неверный логин или пароль' });
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

  return (
    <div className="auth-container">
      <div className="form-header">
        <h2>Вход в систему</h2>
        <p>Введите данные для входа в личный кабинет</p>
      </div>
      
      {errors.general && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          {errors.general}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="login">Логин:</label>
          <input
            type="text"
            id="login"
            name="login"
            value={formData.login}
            onChange={handleChange}
            className="form-control"
            placeholder="Введите ваш логин"
          />
          {errors.login && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              {errors.login}
            </div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Пароль:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="form-control"
            placeholder="Введите ваш пароль"
          />
          {errors.password && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              {errors.password}
            </div>
          )}
        </div>
        
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Загрузка...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt"></i> Войти
              </>
            )}
          </button>
        </div>
      </form>
      
      <div className="switch-form">
        <span>Нет аккаунта?</span>
        <button type="button" onClick={onSwitchToRegister}>
          Зарегистрируйтесь
        </button>
      </div>
    </div>
  );
};

export default Login;
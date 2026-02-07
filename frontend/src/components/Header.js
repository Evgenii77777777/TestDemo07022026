import React from 'react';

const Header = ({ isLoggedIn, user, onLogout, onNavigate }) => {
  return (
    <header className="header">
      <div className="container header-content">
        <div className="logo" onClick={() => onNavigate('home')}>
          <i className="fas fa-broom logo-icon"></i>
          <span>Мой Не Сам</span>
        </div>
        
        <div className="user-info">
          {isLoggedIn ? (
            <>
              <span>Добро пожаловать, {user?.full_name}</span>
              {user?.login === 'adminka' ? (
                <button className="btn" onClick={() => onNavigate('admin')}>
                  <i className="fas fa-cogs"></i> Панель администратора
                </button>
              ) : (
                <button className="btn" onClick={() => onNavigate('orders')}>
                  <i className="fas fa-list"></i> Мои заявки
                </button>
              )}
              <button className="btn btn-danger" onClick={onLogout}>
                <i className="fas fa-sign-out-alt"></i> Выйти
              </button>
            </>
          ) : (
            <div className="nav-buttons">
              <button className="btn" onClick={() => onNavigate('login')}>
                <i className="fas fa-sign-in-alt"></i> Вход
              </button>
              <button className="btn btn-primary" onClick={() => onNavigate('register')}>
                <i className="fas fa-user-plus"></i> Регистрация
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
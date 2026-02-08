import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from './logo';
import ImageSlider from './ImageSlider';


// Главная страница
const HomePage = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

  return (
    <div>
      <header>
         <Logo size="medium" showText={true} />    
        <nav>
          {user ? (
            <>
              <span>Добро пожаловать, {user.name}</span>
              <Link to="/orders">Мои заявки</Link>
              {user.login === 'adminka' && <Link to="/admin">Панель администратора</Link>}
              <button onClick={() => { localStorage.removeItem('user'); window.location.href = '/'; }}>Выйти</button>
            </>
          ) : (
            <>
              <Link to="/login">Вход</Link>
              <Link to="/register">Регистрация</Link>
            </>
          )}
        </nav>
      </header>
      
      <main>
        <section className="hero">
          <h1>Профессиональные клининговые услуги</h1>
          <p>Качественная уборка жилых и производственных помещений</p>
        </section>
        
        <section className="slider-section">
          <ImageSlider />
        </section>

      </main>
    </div>
  );
};


export default HomePage;
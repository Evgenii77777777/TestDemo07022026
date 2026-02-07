import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Slider from './components/Slider';
import Login from './components/Login';
import Register from './components/Register';
import Orders from './components/Orders';
import CreateOrder from './components/CreateOrder';
import AdminPanel from './components/AdminPanel';
import './styles.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // Проверка авторизации при загрузке
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    localStorage.setItem('user', JSON.stringify(userData));
    setCurrentPage('orders');
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('user');
    setCurrentPage('home');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <Login onLogin={handleLogin} onSwitchToRegister={() => setCurrentPage('register')} />;
      case 'register':
        return <Register onRegister={handleLogin} onSwitchToLogin={() => setCurrentPage('login')} />;
      case 'orders':
        return isLoggedIn ? <Orders user={user} onCreateOrder={() => setCurrentPage('create')} /> : <Login onLogin={handleLogin} />;
      case 'create':
        return isLoggedIn ? <CreateOrder user={user} onBack={() => setCurrentPage('orders')} /> : <Login onLogin={handleLogin} />;
      case 'admin':
        return user?.login === 'adminka' ? <AdminPanel /> : <Login onLogin={handleLogin} />;
      default:
        return (
          <div className="home-page">
            <Slider />

          </div>
        );
    }
  };

  return (
    <div className="app">
      <Header 
        isLoggedIn={isLoggedIn} 
        user={user}
        onLogout={handleLogout}
        onNavigate={setCurrentPage}
      />
      <main>
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
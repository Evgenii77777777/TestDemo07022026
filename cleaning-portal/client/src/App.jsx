import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';

// API клиент
const api = {
  register: (data) => fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),

  login: (data) => fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),

  createOrder: (data) => fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),

  getUserOrders: (userId) => fetch(`/api/orders/${userId}`).then(res => res.json()),

  getAdminOrders: () => fetch('/api/admin/orders').then(res => res.json()),

  updateOrderStatus: (id, data) => fetch(`/api/admin/orders/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json())
};

// Компонент слайдера
const ImageSlider = () => {
  const images = ['/images/clean1.jpg', '/images/clean2.jpg', '/images/clean3.jpg', '/images/clean4.jpg', '/images/clean5.jpg'];
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="slider">
      <button className="slider-btn prev" onClick={() => setCurrent(prev => (prev - 1 + images.length) % images.length)}>‹</button>
      <img src={images[current]} alt={`Уборка ${current + 1}`} />
      <button className="slider-btn next" onClick={() => setCurrent(prev => (prev + 1) % images.length)}>›</button>
      <div className="slider-dots">
        {images.map((_, i) => (
          <span key={i} className={`dot ${i === current ? 'active' : ''}`} onClick={() => setCurrent(i)}></span>
        ))}
      </div>
    </div>
  );
};

// Главная страница
const HomePage = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

  return (
    <div>
      <header>
        <div className="logo">«Мой Не Сам»</div>
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
        
        <section className="services">
          <h2>Наши услуги</h2>
          <div className="service-grid">
            <div className="service-card">Общий клининг</div>
            <div className="service-card">Генеральная уборка</div>
            <div className="service-card">Послестроительная уборка</div>
            <div className="service-card">Химчистка ковров и мебели</div>
          </div>
        </section>
      </main>
    </div>
  );
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
    </div>
  );
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
    </div>
  );
};

// Заявки пользователя
const OrdersPage = () => {
  const [user] = useState(JSON.parse(localStorage.getItem('user')));
  const [orders, setOrders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newOrder, setNewOrder] = useState({
    address: '', contactPhone: '', serviceDate: '', serviceTime: '',
    serviceType: 'общий клининг', customService: '', paymentType: 'наличные'
  });

  useEffect(() => {
    if (user) {
      api.getUserOrders(user.id).then(setOrders);
    }
  }, [user]);

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    const result = await api.createOrder({ userId: user.id, ...newOrder });
    if (result.success) {
      alert('Заявка создана!');
      setShowForm(false);
      api.getUserOrders(user.id).then(setOrders);
    }
  };

  if (!user) return <Navigate to="/login" />;

  return (
    <div className="orders-page">
      <h2>Мои заявки</h2>
      <button onClick={() => setShowForm(true)}>Создать новую заявку</button>
      
      {showForm && (
        <div className="modal">
          <form onSubmit={handleCreateOrder}>
            <h3>Новая заявка</h3>
            <input type="text" placeholder="Адрес" required
              value={newOrder.address} onChange={e => setNewOrder({...newOrder, address: e.target.value})} />
            <input type="text" placeholder="Контактный телефон" required
              value={newOrder.contactPhone} onChange={e => setNewOrder({...newOrder, contactPhone: e.target.value})} />
            <input type="date" required value={newOrder.serviceDate}
              onChange={e => setNewOrder({...newOrder, serviceDate: e.target.value})} />
            <input type="time" required value={newOrder.serviceTime}
              onChange={e => setNewOrder({...newOrder, serviceTime: e.target.value})} />
            
            <select value={newOrder.serviceType} onChange={e => setNewOrder({...newOrder, serviceType: e.target.value})}>
              <option value="общий клининг">Общий клининг</option>
              <option value="генеральная уборка">Генеральная уборка</option>
              <option value="послестроительная уборка">Послестроительная уборка</option>
              <option value="химчистка ковров и мебели">Химчистка ковров и мебели</option>
              <option value="другое">Другая услуга</option>
            </select>
            
            {newOrder.serviceType === 'другое' && (
              <textarea placeholder="Опишите услугу" 
                value={newOrder.customService}
                onChange={e => setNewOrder({...newOrder, customService: e.target.value})} />
            )}
            
            <select value={newOrder.paymentType} onChange={e => setNewOrder({...newOrder, paymentType: e.target.value})}>
              <option value="наличные">Наличные</option>
              <option value="карта">Банковская карта</option>
            </select>
            
            <div className="form-actions">
              <button type="submit">Создать</button>
              <button type="button" onClick={() => setShowForm(false)}>Отмена</button>
            </div>
          </form>
        </div>
      )}
      
      <div className="orders-list">
        {orders.map(order => (
          <div key={order.id} className="order-card">
            <p><strong>Адрес:</strong> {order.address}</p>
            <p><strong>Услуга:</strong> {order.service_type}</p>
            <p><strong>Дата:</strong> {order.service_date} {order.service_time}</p>
            <p><strong>Статус:</strong> <span className={`status-${order.status}`}>{order.status}</span></p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Панель администратора
const AdminPage = () => {
  const [user] = useState(JSON.parse(localStorage.getItem('user')));
  const [orders, setOrders] = useState([]);
  const [editingOrder, setEditingOrder] = useState(null);

  useEffect(() => {
    if (user && user.login === 'adminka') {
      api.getAdminOrders().then(setOrders);
    }
  }, [user]);

  const updateStatus = async (id, status, reason = '') => {
    await api.updateOrderStatus(id, { status, cancelReason: reason });
    api.getAdminOrders().then(setOrders);
    setEditingOrder(null);
  };

  if (!user || user.login !== 'adminka') return <Navigate to="/" />;

  return (
    <div className="admin-page">
      <h2>Панель администратора</h2>
      <div className="orders-table">
        {orders.map(order => (
          <div key={order.id} className="admin-order">
            <p><strong>Клиент:</strong> {order.full_name}</p>
            <p><strong>Телефон:</strong> {order.contact_phone}</p>
            <p><strong>Услуга:</strong> {order.service_type}</p>
            <p><strong>Статус:</strong> {order.status}</p>
            
            <div className="status-actions">
              <button onClick={() => updateStatus(order.id, 'в работе')}>В работе</button>
              <button onClick={() => updateStatus(order.id, 'выполнено')}>Выполнено</button>
              <button onClick={() => {
                const reason = prompt('Причина отмены:');
                if (reason) updateStatus(order.id, 'отменено', reason);
              }}>Отменить</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Главный компонент приложения
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
// ==================== Фронтенд: React в одном файле ====================
const { useState, useEffect } = React;

// Главный компонент приложения
function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);
  const API_BASE = 'http://localhost:5000/api';

  // Проверка авторизации
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setCurrentPage(userData.login === 'adminka' ? 'admin' : 'orders');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setCurrentPage('home');
  };

  return (
    <div className="app">
      <Header user={user} onLogout={handleLogout} onNavigate={setCurrentPage} />
      <main>
        {currentPage === 'home' && <HomePage onNavigate={setCurrentPage} />}
        {currentPage === 'login' && <LoginPage onLogin={handleLogin} onNavigate={setCurrentPage} apiBase={API_BASE} />}
        {currentPage === 'register' && <RegisterPage onLogin={handleLogin} onNavigate={setCurrentPage} apiBase={API_BASE} />}
        {currentPage === 'orders' && <OrdersPage user={user} onNavigate={setCurrentPage} apiBase={API_BASE} />}
        {currentPage === 'create' && <CreateOrderPage user={user} onNavigate={setCurrentPage} apiBase={API_BASE} />}
        {currentPage === 'admin' && <AdminPage user={user} apiBase={API_BASE} />}
      </main>
      <Footer />
    </div>
  );
}

// Шапка
function Header({ user, onLogout, onNavigate }) {
  return (
    <header className="header">
      <div className="logo" onClick={() => onNavigate('home')}>
        <i className="fas fa-broom"></i> Мой Не Сам
      </div>
      <div className="nav-buttons">
        {user ? (
          <>
            <span>Добро пожаловать, {user.full_name}</span>
            {user.login === 'adminka' ? (
              <button onClick={() => onNavigate('admin')}><i className="fas fa-cogs"></i> Админ</button>
            ) : (
              <button onClick={() => onNavigate('orders')}><i className="fas fa-list"></i> Заявки</button>
            )}
            <button onClick={onLogout} className="btn-danger"><i className="fas fa-sign-out-alt"></i> Выйти</button>
          </>
        ) : (
          <>
            <button onClick={() => onNavigate('login')}><i className="fas fa-sign-in-alt"></i> Вход</button>
            <button onClick={() => onNavigate('register')} className="btn-primary"><i className="fas fa-user-plus"></i> Регистрация</button>
          </>
        )}
      </div>
    </header>
  );
}

// Главная страница со слайдером
function HomePage({ onNavigate }) {
  const [slideIndex, setSlideIndex] = useState(0);
  const slides = [
    'Профессиональная уборка квартир',
    'Генеральная уборка домов и офисов',
    'Послестроительная уборка',
    'Химчистка мебели и ковров',
    'Экологичные моющие средства'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIndex(i => (i + 1) % slides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="home-page">
      <div className="slider">
        <div className="slides" style={{ transform: `translateX(-${slideIndex * 100}%)` }}>
          {slides.map((text, i) => (
            <div key={i} className="slide">{text}</div>
          ))}
        </div>
        <button className="slider-btn prev" onClick={() => setSlideIndex(i => (i - 1 + slides.length) % slides.length)}>‹</button>
        <button className="slider-btn next" onClick={() => setSlideIndex(i => (i + 1) % slides.length)}>›</button>
      </div>
      
      <div className="welcome">
        <h2>Добро пожаловать в "Мой Не Сам"</h2>
        <div className="services">
          <div className="service-card"><i className="fas fa-broom"></i><h3>Общий клининг</h3></div>
          <div className="service-card"><i className="fas fa-house-chimney"></i><h3>Генеральная уборка</h3></div>
          <div className="service-card"><i className="fas fa-building"></i><h3>Послестроительная</h3></div>
          <div className="service-card"><i className="fas fa-couch"></i><h3>Химчистка</h3></div>
        </div>
        <div className="auth-buttons">
          <button onClick={() => onNavigate('login')} className="btn-primary">Вход в систему</button>
          <button onClick={() => onNavigate('register')}>Регистрация</button>
        </div>
      </div>
    </div>
  );
}

// Страница входа
function LoginPage({ onLogin, onNavigate, apiBase }) {
  const [form, setForm] = useState({ login: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        onLogin(data.user);
      } else {
        setErrors(data.errors || { general: 'Ошибка входа' });
      }
    } catch {
      setErrors({ general: 'Ошибка соединения' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <h2>Вход в систему</h2>
      {errors.general && <div className="error">{errors.general}</div>}
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Логин" value={form.login} onChange={e => setForm({...form, login: e.target.value})} />
        {errors.login && <div className="error">{errors.login}</div>}
        <input type="password" placeholder="Пароль" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
        {errors.password && <div className="error">{errors.password}</div>}
        <button type="submit" disabled={loading}>{loading ? 'Загрузка...' : 'Войти'}</button>
      </form>
      <p>Нет аккаунта? <button className="link" onClick={() => onNavigate('register')}>Зарегистрируйтесь</button></p>
    </div>
  );
}

// Страница регистрации
function RegisterPage({ onLogin, onNavigate, apiBase }) {
  const [form, setForm] = useState({ login: '', password: '', fullName: '', phone: '', email: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        // Автовход после регистрации
        const loginRes = await fetch(`${apiBase}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ login: form.login, password: form.password })
        });
        const loginData = await loginRes.json();
        if (loginData.success) onLogin(loginData.user);
      } else {
        setErrors(data.errors || { general: 'Ошибка регистрации' });
      }
    } catch {
      setErrors({ general: 'Ошибка соединения' });
    } finally {
      setLoading(false);
    }
  };

  const formatPhone = (value) => {
    const nums = value.replace(/\D/g, '');
    let formatted = '+7(';
    if (nums.length > 1) formatted += nums.substring(1, 4);
    if (nums.length >= 4) formatted += ')-' + nums.substring(4, 7);
    if (nums.length >= 7) formatted += '-' + nums.substring(7, 9);
    if (nums.length >= 9) formatted += '-' + nums.substring(9, 11);
    return formatted;
  };

  return (
    <div className="auth-page">
      <h2>Регистрация</h2>
      {errors.general && <div className="error">{errors.general}</div>}
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Логин*" value={form.login} onChange={e => setForm({...form, login: e.target.value})} />
        {errors.login && <div className="error">{errors.login}</div>}
        <input type="password" placeholder="Пароль* (мин. 6 символов)" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
        {errors.password && <div className="error">{errors.password}</div>}
        <input type="text" placeholder="ФИО* (кириллица)" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} />
        {errors.fullName && <div className="error">{errors.fullName}</div>}
        <input type="text" placeholder="Телефон* +7(XXX)-XXX-XX-XX" value={form.phone} 
          onChange={e => setForm({...form, phone: formatPhone(e.target.value)})} />
        {errors.phone && <div className="error">{errors.phone}</div>}
        <input type="email" placeholder="Email*" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
        {errors.email && <div className="error">{errors.email}</div>}
        <button type="submit" disabled={loading}>{loading ? 'Регистрация...' : 'Зарегистрироваться'}</button>
      </form>
      <p>Уже есть аккаунт? <button className="link" onClick={() => onNavigate('login')}>Войдите</button></p>
    </div>
  );
}

// Страница заявок
function OrdersPage({ user, onNavigate, apiBase }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${apiBase}/orders/${user.id}`);
      const data = await res.json();
      if (data.success) setOrders(data.orders);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="orders-page">
      <h2>Мои заявки <button onClick={() => onNavigate('create')} className="btn-primary">+ Новая заявка</button></h2>
      {loading ? <div>Загрузка...</div> : orders.length === 0 ? (
        <div className="empty">Нет заявок</div>
      ) : (
        <table>
          <thead>
            <tr><th>№</th><th>Услуга</th><th>Адрес</th><th>Дата</th><th>Статус</th></tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.service_type}</td>
                <td>{o.address}</td>
                <td>{new Date(o.preferred_date).toLocaleDateString()}</td>
                <td><span className={`status-${o.status.replace(' ', '')}`}>{o.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// Создание заявки
function CreateOrderPage({ user, onNavigate, apiBase }) {
  const [form, setForm] = useState({
    address: '', contactPhone: user?.phone || '', serviceType: 'общий клининг',
    customService: '', preferredDate: '', preferredTime: '10:00', paymentType: 'наличные', otherService: false
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch(`${apiBase}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          address: form.address,
          contactPhone: form.contactPhone,
          serviceType: form.otherService ? 'иная услуга' : form.serviceType,
          customService: form.customService,
          preferredDate: form.preferredDate,
          preferredTime: form.preferredTime,
          paymentType: form.paymentType
        })
      });
      setSuccess(true);
      setTimeout(() => onNavigate('orders'), 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page">
      <h2>Новая заявка <button onClick={() => onNavigate('orders')}>← Назад</button></h2>
      {success && <div className="success">Заявка создана!</div>}
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Адрес*" value={form.address} onChange={e => setForm({...form, address: e.target.value})} required />
        <input type="text" placeholder="Телефон*" value={form.contactPhone} onChange={e => setForm({...form, contactPhone: e.target.value})} required />
        <select value={form.serviceType} onChange={e => setForm({...form, serviceType: e.target.value})} disabled={form.otherService}>
          <option>общий клининг</option><option>генеральная уборка</option>
          <option>послестроительная уборка</option><option>химчистка ковров и мебели</option>
        </select>
        <label><input type="checkbox" checked={form.otherService} 
          onChange={e => setForm({...form, otherService: e.target.checked})} /> Иная услуга</label>
        {form.otherService && <textarea placeholder="Опишите услугу" value={form.customService} 
          onChange={e => setForm({...form, customService: e.target.value})} />}
        <input type="date" value={form.preferredDate} onChange={e => setForm({...form, preferredDate: e.target.value})} required />
        <select value={form.preferredTime} onChange={e => setForm({...form, preferredTime: e.target.value})}>
          {Array.from({length: 10}, (_, i) => 9 + i).flatMap(h => [`${h}:00`, `${h}:30`])
            .map(t => <option key={t}>{t}</option>)}
        </select>
        <div>
          <label><input type="radio" name="pay" checked={form.paymentType === 'наличные'} 
            onChange={() => setForm({...form, paymentType: 'наличные'})} /> Наличные</label>
          <label><input type="radio" name="pay" checked={form.paymentType === 'карта'} 
            onChange={() => setForm({...form, paymentType: 'карта'})} /> Карта</label>
        </div>
        <button type="submit" disabled={loading}>{loading ? 'Отправка...' : 'Отправить заявку'}</button>
      </form>
    </div>
  );
}

// Админ-панель
function AdminPage({ user, apiBase }) {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('все');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const res = await fetch(`${apiBase}/admin/orders`);
    const data = await res.json();
    if (data.success) setOrders(data.orders);
  };

  const updateStatus = async (id, status) => {
    if (status === 'отменено') {
      const reason = prompt('Причина отмены:');
      if (!reason) return;
      await fetch(`${apiBase}/admin/orders/${id}`, {
        method: 'PUT',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({status, cancelReason: reason})
      });
    } else {
      await fetch(`${apiBase}/admin/orders/${id}`, {
        method: 'PUT',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({status})
      });
    }
    fetchOrders();
  };

  const filtered = filter === 'все' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="admin-page">
      <h2>Панель администратора <button onClick={fetchOrders}>Обновить</button></h2>
      <select value={filter} onChange={e => setFilter(e.target.value)}>
        <option>все</option><option>новая</option><option>в работе</option>
        <option>выполнено</option><option>отменено</option>
      </select>
      <table>
        <thead>
          <tr><th>№</th><th>Клиент</th><th>Услуга</th><th>Адрес</th><th>Статус</th><th>Действия</th></tr>
        </thead>
        <tbody>
          {filtered.map(o => (
            <tr key={o.id}>
              <td>{o.id}</td><td>{o.full_name}</td><td>{o.service_type}</td>
              <td>{o.address}</td><td><span className={`status-${o.status.replace(' ', '')}`}>{o.status}</span></td>
              <td>
                {o.status !== 'в работе' && <button onClick={() => updateStatus(o.id, 'в работе')}>В работу</button>}
                {o.status !== 'выполнено' && <button onClick={() => updateStatus(o.id, 'выполнено')}>Выполнено</button>}
                {o.status !== 'отменено' && <button onClick={() => updateStatus(o.id, 'отменено')}>Отменить</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Футер
function Footer() {
  return (
    <footer className="footer">
      <p>© 2024 "Мой Не Сам". Телефон: +7(800)-123-45-67 | Email: info@moynesam.ru</p>
    </footer>
  );
}

// HTML файл с CSS стилями
const html = `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Мой Не Сам - Клининговые услуги</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family: 'Segoe UI', sans-serif; background:#f5f7fa; color:#333; }
        .app { min-height:100vh; display:flex; flex-direction:column; }
        
        /* Шапка */
        .header { background:linear-gradient(135deg,#4b6cb7,#182848); color:white; padding:1rem 2rem;
            display:flex; justify-content:space-between; align-items:center; box-shadow:0 2px 10px rgba(0,0,0,0.1); }
        .logo { font-size:1.5rem; font-weight:bold; cursor:pointer; }
        .nav-buttons { display:flex; gap:1rem; align-items:center; }
        .nav-buttons button { background:rgba(255,255,255,0.2); border:none; color:white; padding:0.5rem 1rem;
            border-radius:5px; cursor:pointer; transition:background 0.3s; }
        .nav-buttons button:hover { background:rgba(255,255,255,0.3); }
        .btn-primary { background:white!important; color:#4b6cb7!important; font-weight:600; }
        .btn-danger { background:#dc3545!important; }
        
        /* Слайдер */
        .slider { width:100%; max-width:1200px; margin:2rem auto; position:relative; overflow:hidden;
            border-radius:15px; box-shadow:0 5px 25px rgba(0,0,0,0.2); height:400px; }
        .slides { display:flex; transition:transform 0.5s; height:100%; }
        .slide { min-width:100%; display:flex; align-items:center; justify-content:center;
            font-size:2.5rem; font-weight:bold; color:white; text-shadow:2px 2px 8px rgba(0,0,0,0.7);
            background:linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.5)), center/cover; }
        .slide:nth-child(1){background-image:url('https://images.unsplash.com/photo-1581578731548-c64695cc6952');}
        .slide:nth-child(2){background-image:url('https://images.unsplash.com/photo-1560518883-ce09059eeffa');}
        .slide:nth-child(3){background-image:url('https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf');}
        .slide:nth-child(4){background-image:url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64');}
        .slide:nth-child(5){background-image:url('https://images.unsplash.com/photo-1585747860715-2ba37e788b70');}
        .slider-btn { position:absolute; top:50%; transform:translateY(-50%); background:rgba(255,255,255,0.8);
            border:none; width:50px; height:50px; border-radius:50%; cursor:pointer; font-size:1.5rem; }
        .prev { left:1rem; } .next { right:1rem; }
        
        /* Главная */
        .welcome { text-align:center; padding:3rem; }
        .services { display:grid; grid-template-columns:repeat(auto-fit, minmax(250px,1fr)); gap:2rem; margin:3rem 0; }
        .service-card { background:white; padding:2rem; border-radius:8px; box-shadow:0 2px 10px rgba(0,0,0,0.1); }
        .auth-buttons { display:flex; gap:1rem; justify-content:center; }
        
        /* Формы */
        .auth-page, .form-page, .orders-page, .admin-page { max-width:800px; margin:2rem auto; padding:2rem;
            background:white; border-radius:10px; box-shadow:0 5px 20px rgba(0,0,0,0.1); }
        input, select, textarea { width:100%; padding:0.75rem; margin:0.5rem 0; border:2px solid #e9ecef;
            border-radius:5px; font-size:1rem; }
        input:focus, select:focus, textarea:focus { outline:none; border-color:#4b6cb7; }
        button { padding:0.75rem 1.5rem; border:none; border-radius:5px; cursor:pointer; font-size:1rem; }
        .error { color:#dc3545; font-size:0.875rem; margin-top:0.25rem; }
        .success { color:#28a745; background:#d4edda; padding:0.75rem; border-radius:5px; margin:1rem 0; }
        
        /* Таблицы */
        table { width:100%; border-collapse:collapse; margin:1rem 0; }
        th, td { padding:1rem; text-align:left; border-bottom:1px solid #dee2e6; }
        th { background:#f8f9fa; }
        .status-новая { color:#007bff; } .status-вработе { color:#ffc107; }
        .status-выполнено { color:#28a745; } .status-отменено { color:#dc3545; }
        
        /* Футер */
        .footer { background:#182848; color:white; text-align:center; padding:1.5rem; margin-top:3rem; }
        
        /* Адаптивность */
        @media (max-width:768px) {
            .header { flex-direction:column; gap:1rem; text-align:center; }
            .slide { font-size:1.5rem; height:300px; }
            .services { grid-template-columns:1fr; }
            .auth-page, .form-page { margin:1rem; padding:1.5rem; }
        }
    </style>
</head>
<body>
    <div id="root"></div>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script type="text/babel">
        ${document.querySelector('script').textContent}
        ReactDOM.createRoot(document.getElementById('root')).render(<App />);
    </script>
</body>
</html>
`;

// Сохранить HTML
if (typeof window === 'undefined') {
  const fs = require('fs');
  fs.writeFileSync('public/index.html', html);
  console.log('✅ HTML файл создан: public/index.html');
}
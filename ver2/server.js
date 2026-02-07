// ==================== Бэкенд: Node.js + Express + PostgreSQL ====================
const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Подключение к PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'clean_service_db',
  password: '1', // измените на ваш пароль
  port: 5432,
});

// Инициализация базы данных
const initDatabase = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        login VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        address TEXT NOT NULL,
        contact_phone VARCHAR(20) NOT NULL,
        service_type VARCHAR(50) NOT NULL,
        custom_service TEXT,
        preferred_date DATE NOT NULL,
        preferred_time TIME NOT NULL,
        payment_type VARCHAR(20) NOT NULL,
        status VARCHAR(20) DEFAULT 'новая',
        cancel_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Администратор и тестовые пользователи
    await client.query(`
      INSERT INTO users (login, password, full_name, phone, email) VALUES
        ('adminka', 'cleanservic', 'Администратор', '+7(999)-999-99-99', 'admin@clean.ru'),
        ('testuser', 'test123', 'Иванов Иван', '+7(912)-345-67-89', 'ivan@mail.ru'),
        ('client1', 'client123', 'Петрова Мария', '+7(923)-456-78-90', 'maria@gmail.com')
      ON CONFLICT (login) DO NOTHING
    `);

    console.log('✅ База данных инициализирована');
  } finally {
    client.release();
  }
};

// API маршруты
// Регистрация
app.post('/api/register', async (req, res) => {
  try {
    const { login, password, fullName, phone, email } = req.body;
    
    // Валидация
    const errors = {};
    if (!login || login.length < 3) errors.login = 'Логин мин. 3 символа';
    if (!password || password.length < 6) errors.password = 'Пароль мин. 6 символов';
    if (!/^[А-Яа-яЁё\s]+$/.test(fullName)) errors.fullName = 'Только кириллица';
    if (!/^\+7\(\d{3}\)-\d{3}-\d{2}-\d{2}$/.test(phone)) errors.phone = 'Формат +7(XXX)-XXX-XX-XX';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Некорректный email';
    
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, errors });
    }
    
    // Проверка уникальности логина
    const existing = await pool.query('SELECT id FROM users WHERE login = $1', [login]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, errors: { login: 'Логин занят' } });
    }
    
    // Создание пользователя
    await pool.query(
      'INSERT INTO users (login, password, full_name, phone, email) VALUES ($1, $2, $3, $4, $5)',
      [login, password, fullName, phone, email]
    );
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, errors: { general: 'Ошибка сервера' } });
  }
});

// Вход
app.post('/api/login', async (req, res) => {
  try {
    const { login, password } = req.body;
    const result = await pool.query(
      'SELECT id, login, full_name, phone, email FROM users WHERE login = $1 AND password = $2',
      [login, password]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, errors: { general: 'Неверный логин/пароль' } });
    }
    
    res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, errors: { general: 'Ошибка сервера' } });
  }
});

// Заявки пользователя
app.get('/api/orders/:userId', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [req.params.userId]
    );
    res.json({ success: true, orders: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Создание заявки
app.post('/api/orders', async (req, res) => {
  try {
    const { userId, address, contactPhone, serviceType, customService, preferredDate, preferredTime, paymentType } = req.body;
    
    const result = await pool.query(
      `INSERT INTO orders (user_id, address, contact_phone, service_type, custom_service, preferred_date, preferred_time, payment_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [userId, address, contactPhone, serviceType, customService, preferredDate, preferredTime, paymentType]
    );
    
    res.json({ success: true, order: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Все заявки для админа
app.get('/api/admin/orders', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, u.full_name, u.phone, u.email 
       FROM orders o 
       JOIN users u ON o.user_id = u.id 
       ORDER BY o.created_at DESC`
    );
    res.json({ success: true, orders: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Обновление статуса заявки
app.put('/api/admin/orders/:id', async (req, res) => {
  try {
    const { status, cancelReason } = req.body;
    const query = cancelReason 
      ? 'UPDATE orders SET status = $1, cancel_reason = $2 WHERE id = $3 RETURNING *'
      : 'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *';
    
    const params = cancelReason ? [status, cancelReason, req.params.id] : [status, req.params.id];
    const result = await pool.query(query, params);
    
    res.json({ success: true, order: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Статические файлы React
app.use(express.static('public'));

// Запуск сервера
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Сервер запущен: http://localhost:${PORT}`);
    console.log(`📁 API доступен: http://localhost:${PORT}/api`);
  });
}).catch(err => {
  console.error('❌ Ошибка БД:', err);
});
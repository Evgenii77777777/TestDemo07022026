require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// Подключение к PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'cleaning_service',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

// Создание таблиц при запуске
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        login VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        address TEXT NOT NULL,
        contact_phone VARCHAR(20) NOT NULL,
        service_date DATE NOT NULL,
        service_time TIME NOT NULL,
        service_type VARCHAR(50) NOT NULL,
        custom_service TEXT,
        payment_type VARCHAR(20) NOT NULL,
        status VARCHAR(20) DEFAULT 'новый',
        cancel_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      INSERT INTO users (login, password, full_name, phone, email) 
      SELECT 'adminka', 'cleanservic', 'Администратор', '+7(999)-999-99-99', 'admin@clean.ru'
      WHERE NOT EXISTS (SELECT 1 FROM users WHERE login = 'adminka');
    `);
    console.log('База данных инициализирована');
  } catch (err) {
    console.error('Ошибка инициализации БД:', err);
  }
}

// API роуты
app.post('/api/register', async (req, res) => {
  try {
    const { login, password, full_name, phone, email } = req.body;
    
    // Валидация
    if (!login || !password || !full_name || !phone || !email) {
      return res.status(400).json({ error: 'Все поля обязательны' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Пароль должен быть минимум 6 символов' });
    }
    
    const result = await pool.query(
      'INSERT INTO users (login, password, full_name, phone, email) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [login, password, full_name, phone, email]
    );
    
    res.json({ success: true, userId: result.rows[0].id });
  } catch (err) {
    if (err.code === '23505') {
      res.status(400).json({ error: 'Логин уже существует' });
    } else {
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { login, password } = req.body;
    const result = await pool.query(
      'SELECT id, login, full_name FROM users WHERE login = $1 AND password = $2',
      [login, password]
    );
    
    if (result.rows.length > 0) {
      const user = result.rows[0];
      // Упрощенная аутентификация (без JWT)
      res.json({ 
        success: true, 
        user: { id: user.id, login: user.login, name: user.full_name },
        isAdmin: login === 'adminka'
      });
    } else {
      res.status(401).json({ error: 'Неверный логин или пароль' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { userId, ...orderData } = req.body;
    const result = await pool.query(
      `INSERT INTO orders (user_id, address, contact_phone, service_date, service_time, 
        service_type, custom_service, payment_type, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'новый') RETURNING id`,
      [userId, orderData.address, orderData.contactPhone, orderData.serviceDate,
       orderData.serviceTime, orderData.serviceType, orderData.customService || null,
       orderData.paymentType]
    );
    res.json({ success: true, orderId: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка создания заявки' });
  }
});

app.get('/api/orders/:userId', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [req.params.userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка получения заявок' });
  }
});

app.get('/api/admin/orders', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.*, u.full_name, u.phone, u.email 
      FROM orders o 
      JOIN users u ON o.user_id = u.id 
      ORDER BY o.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка получения заявок' });
  }
});

app.put('/api/admin/orders/:id', async (req, res) => {
  try {
    const { status, cancelReason } = req.body;
    await pool.query(
      'UPDATE orders SET status = $1, cancel_reason = $2 WHERE id = $3',
      [status, cancelReason || null, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка обновления заявки' });
  }
});

// Статические файлы фронтенда
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('../client/build'));
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  initDB();
});
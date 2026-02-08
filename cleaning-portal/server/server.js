require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// Подключение к PostgreSQL с упрощенными настройками для Windows
const pool = new Pool({

  user: 'postgres',           // стандартный пользователь
  host: 'localhost',          // локальный сервер
  database: 'cleaning_service', // имя базы данных
  password: '1',              // ваш пароль
  port: 5432,                 // стандартный порт PostgreSQL
});

// Простой тест соединения
pool.on('connect', () => {
  console.log('Подключено к PostgreSQL');
});

pool.on('error', (err) => {
  console.error('Ошибка PostgreSQL:', err);
});

// Создание таблиц при запуске (с проверкой)
async function initDB() {
  const client = await pool.connect();
  try {
    console.log('Инициализация базы данных...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        login VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
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
    `);

    // Проверяем существование админа
    const adminCheck = await client.query(
      "SELECT id FROM users WHERE login = 'adminka'"
    );
    
    if (adminCheck.rows.length === 0) {
      await client.query(`
        INSERT INTO users (login, password, full_name, phone, email) 
        VALUES ('adminka', 'cleanservic', 'Администратор', '+7(999)-999-99-99', 'admin@clean.ru')
      `);
      console.log('Администратор создан');
    }
    
    console.log('База данных инициализирована');
  } catch (err) {
    console.error('Ошибка инициализации БД:', err.message);
  } finally {
    client.release();
  }
}

// API роуты

// Регистрация
app.post('/api/register', async (req, res) => {
  try {
    const { login, password, full_name, phone, email } = req.body;
    
    console.log('Регистрация:', { login, full_name });
    
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
    console.error('Ошибка регистрации:', err);
    if (err.code === '23505') {
      res.status(400).json({ error: 'Логин уже существует' });
    } else {
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }
});

// Вход
app.post('/api/login', async (req, res) => {
  try {
    const { login, password } = req.body;
    console.log('Вход:', login);
    
    const result = await pool.query(
      'SELECT id, login, full_name FROM users WHERE login = $1 AND password = $2',
      [login, password]
    );
    
    if (result.rows.length > 0) {
      const user = result.rows[0];
      res.json({ 
        success: true, 
        user: { id: user.id, login: user.login, name: user.full_name },
        isAdmin: login === 'adminka'
      });
    } else {
      res.status(401).json({ error: 'Неверный логин или пароль' });
    }
  } catch (err) {
    console.error('Ошибка входа:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Создание заявки
app.post('/api/orders', async (req, res) => {
  try {
    const { userId, ...orderData } = req.body;
    console.log('Создание заявки для пользователя:', userId);
    
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
    console.error('Ошибка создания заявки:', err);
    res.status(500).json({ error: 'Ошибка создания заявки' });
  }
});

// Получение заявок пользователя
app.get('/api/orders/:userId', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [req.params.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Ошибка получения заявок:', err);
    res.status(500).json({ error: 'Ошибка получения заявок' });
  }
});

// Получение всех заявок для администратора
app.get('/api/admin/orders', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.*, u.full_name, u.phone, u.email 
      FROM orders o 
      LEFT JOIN users u ON o.user_id = u.id 
      ORDER BY o.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Ошибка получения заявок админа:', err);
    res.status(500).json({ error: 'Ошибка получения заявок' });
  }
});

// Обновление статуса заявки
app.put('/api/admin/orders/:id', async (req, res) => {
  try {
    const { status, cancelReason } = req.body;
    await pool.query(
      'UPDATE orders SET status = $1, cancel_reason = $2 WHERE id = $3',
      [status, cancelReason || null, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Ошибка обновления заявки:', err);
    res.status(500).json({ error: 'Ошибка обновления заявки' });
  }
});

// Проверка соединения
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', database: 'disconnected', error: err.message });
  }
});

// Статические файлы фронтенда
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`Доступ по адресу: http://localhost:${PORT}`);
  
  try {
    await initDB();
  } catch (err) {
    console.error('Не удалось инициализировать БД:', err.message);
    console.log('Приложение будет работать без БД, используйте тестовый режим');
  }
});
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'clean_service_db',
  password: '1', // Замените на ваш пароль
  port: 5432,
});

const initDatabase = async () => {
  const client = await pool.connect();
  try {
    // Таблица пользователей
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

    // Таблица заявок
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
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

    // Администратор по умолчанию
    await client.query(`
      INSERT INTO users (login, password, full_name, phone, email)
      VALUES ('adminka', 'cleanservic', 'Администратор', '+7(999)-999-99-99', 'admin@cleaning.ru')
      ON CONFLICT (login) DO NOTHING
    `);

    console.log('База данных инициализирована');
  } finally {
    client.release();
  }
};

module.exports = { pool, initDatabase };
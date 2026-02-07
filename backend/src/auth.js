const { pool } = require('./database');

const validateUserData = (userData) => {
  const errors = {};
  
  // Проверка логина
  if (!userData.login || userData.login.length < 3) {
    errors.login = 'Логин должен содержать минимум 3 символа';
  }
  
  // Проверка пароля
  if (!userData.password || userData.password.length < 6) {
    errors.password = 'Пароль должен содержать минимум 6 символов';
  }
  
  // Проверка ФИО (кириллица и пробелы)
  const nameRegex = /^[А-Яа-яЁё\s]+$/;
  if (!userData.fullName || !nameRegex.test(userData.fullName)) {
    errors.fullName = 'ФИО должно содержать только кириллические символы и пробелы';
  }
  
  // Проверка телефона
  const phoneRegex = /^\+7\(\d{3}\)-\d{3}-\d{2}-\d{2}$/;
  if (!userData.phone || !phoneRegex.test(userData.phone)) {
    errors.phone = 'Телефон должен быть в формате +7(XXX)-XXX-XX-XX';
  }
  
  // Проверка email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!userData.email || !emailRegex.test(userData.email)) {
    errors.email = 'Введите корректный email';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

const registerUser = async (userData) => {
  const validation = validateUserData(userData);
  if (!validation.isValid) {
    return { success: false, errors: validation.errors };
  }
  
  const client = await pool.connect();
  try {
    // Проверка уникальности логина
    const existingUser = await client.query(
      'SELECT id FROM users WHERE login = $1',
      [userData.login]
    );
    
    if (existingUser.rows.length > 0) {
      return { 
        success: false, 
        errors: { login: 'Пользователь с таким логином уже существует' } 
      };
    }
    
    // Создание пользователя
    await client.query(
      `INSERT INTO users (login, password, full_name, phone, email) 
       VALUES ($1, $2, $3, $4, $5)`,
      [userData.login, userData.password, userData.fullName, 
       userData.phone, userData.email]
    );
    
    return { success: true };
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    return { 
      success: false, 
      errors: { general: 'Ошибка сервера при регистрации' } 
    };
  } finally {
    client.release();
  }
};

const loginUser = async (login, password) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT id, login, full_name, phone, email 
       FROM users WHERE login = $1 AND password = $2`,
      [login, password]
    );
    
    if (result.rows.length === 0) {
      return { 
        success: false, 
        errors: { general: 'Неверный логин или пароль' } 
      };
    }
    
    return { 
      success: true, 
      user: result.rows[0] 
    };
  } catch (error) {
    console.error('Ошибка входа:', error);
    return { 
      success: false, 
      errors: { general: 'Ошибка сервера при входе' } 
    };
  } finally {
    client.release();
  }
};

module.exports = { validateUserData, registerUser, loginUser };
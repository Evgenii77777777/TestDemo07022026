const express = require('express');
const { registerUser, loginUser } = require('./auth');
const { pool } = require('./database');

const router = express.Router();

// Регистрация
router.post('/register', async (req, res) => {
  const result = await registerUser(req.body);
  if (result.success) {
    res.json({ success: true });
  } else {
    res.status(400).json({ success: false, errors: result.errors });
  }
});

// Вход
router.post('/login', async (req, res) => {
  const { login, password } = req.body;
  const result = await loginUser(login, password);
  if (result.success) {
    res.json({ success: true, user: result.user });
  } else {
    res.status(401).json({ success: false, errors: result.errors });
  }
});

// Получение заявок пользователя
router.get('/orders/:userId', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, u.full_name 
       FROM orders o 
       JOIN users u ON o.user_id = u.id 
       WHERE o.user_id = $1 
       ORDER BY o.created_at DESC`,
      [req.params.userId]
    );
    res.json({ success: true, orders: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Создание заявки
router.post('/orders', async (req, res) => {
  const { userId, address, contactPhone, serviceType, customService, 
          preferredDate, preferredTime, paymentType } = req.body;
  
  try {
    const result = await pool.query(
      `INSERT INTO orders 
       (user_id, address, contact_phone, service_type, custom_service, 
        preferred_date, preferred_time, payment_type) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [userId, address, contactPhone, serviceType, customService, 
       preferredDate, preferredTime, paymentType]
    );
    
    res.json({ success: true, order: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Получение всех заявок (для админа)
router.get('/admin/orders', async (req, res) => {
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
router.put('/admin/orders/:id', async (req, res) => {
  const { status, cancelReason } = req.body;
  
  try {
    const query = cancelReason 
      ? `UPDATE orders SET status = $1, cancel_reason = $2 WHERE id = $3 RETURNING *`
      : `UPDATE orders SET status = $1 WHERE id = $2 RETURNING *`;
    
    const params = cancelReason 
      ? [status, cancelReason, req.params.id]
      : [status, req.params.id];
    
    const result = await pool.query(query, params);
    res.json({ success: true, order: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
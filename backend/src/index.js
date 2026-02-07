const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./routes');
const { initDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Маршруты API
app.use('/api', routes);

// Инициализация и запуск
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
  });
});
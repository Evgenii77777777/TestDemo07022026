-- Создание базы данных (выполнить отдельно в pgAdmin или psql)
-- CREATE DATABASE clean_service_db;

-- Таблицы создаются автоматически в server.js, но если нужно вручную:

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
);

-- Тестовые данные
INSERT INTO users (login, password, full_name, phone, email) VALUES
    ('adminka', 'cleanservic', 'Администратор', '+7(999)-999-99-99', 'admin@clean.ru'),
    ('testuser', 'test123', 'Иванов Иван Иванович', '+7(912)-345-67-89', 'ivan@mail.ru'),
    ('client1', 'client123', 'Петрова Мария Сергеевна', '+7(923)-456-78-90', 'maria@gmail.com')
ON CONFLICT (login) DO NOTHING;

INSERT INTO orders (user_id, address, contact_phone, service_type, preferred_date, preferred_time, payment_type, status) VALUES
    (2, 'ул. Ленина, 10', '+7(912)-345-67-89', 'генеральная уборка', '2024-01-20', '10:00', 'наличные', 'в работе'),
    (3, 'пр. Мира, 25', '+7(923)-456-78-90', 'общий клининг', '2024-01-22', '14:00', 'карта', 'новая'),
    (2, 'ул. Советская, 45', '+7(912)-345-67-89', 'химчистка ковров', '2024-01-18', '11:30', 'наличные', 'выполнено')
ON CONFLICT DO NOTHING;
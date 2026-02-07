@echo off
echo ============================================
echo   Запуск портала клининговых услуг
echo            "Мой Не Сам"
echo ============================================
echo.

echo 1. Проверка Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo Ошибка: Установите Node.js с https://nodejs.org/
    pause
    exit /b 1
)

echo 2. Проверка PostgreSQL...
echo Убедитесь, что PostgreSQL запущен на порту 5432
echo и создана база данных 'clean_service_db'
echo.

echo 3. Установка зависимостей...
npm init -y >nul 2>&1
npm install express pg >nul 2>&1

echo 4. Создание структуры папок...
if not exist public mkdir public

echo 5. Запуск клиента и сервера...
echo Для запуска выполните:
echo.
echo ОТКРОЙТЕ ПЕРВОЕ ОКНО КОМАНДНОЙ СТРОКИ:
echo node server.js
echo.
echo ОТКРОЙТЕ БРАУЗЕР И ПЕРЕЙДИТЕ ПО АДРЕСУ:
echo http://localhost:5000
echo.
echo Учетные данные для входа:
echo - Администратор: логин=adminka, пароль=cleanservic
echo - Пользователь: логин=testuser, пароль=test123
echo - Пользователь: логин=client1, пароль=client123
echo.
pause
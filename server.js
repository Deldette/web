const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

const usersFile = path.join(__dirname, 'users.json');

// Чтение пользователей из файла
function readUsers() {
    try {
        if (fs.existsSync(usersFile)) {
            const data = fs.readFileSync(usersFile, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Ошибка чтения файла пользователей:', error);
    }
    return {};
}

// Запись пользователей в файл
function writeUsers(users) {
    try {
        fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
        return true;
    } catch (error) {
        console.error('Ошибка записи в файл пользователей:', error);
        return false;
    }
}

// Маршрут для главной страницы
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Регистрация
app.post('/register', (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Заполните все поля' });
    }

    // Простая валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: 'Введите корректный email' });
    }

    const users = readUsers();
    
    if (users[email]) {
        return res.status(400).json({ success: false, message: 'Пользователь с таким email уже существует' });
    }

    users[email] = { 
        password: password, 
        registered: new Date().toISOString() 
    };
    
    if (writeUsers(users)) {
        console.log(`Зарегистрирован новый пользователь: ${email}`);
        res.json({ success: true, message: 'Регистрация успешна! Теперь вы можете войти.' });
    } else {
        res.status(500).json({ success: false, message: 'Ошибка сервера при сохранении данных' });
    }
});

// Вход
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Заполните все поля' });
    }

    const users = readUsers();
    const user = users[email];
    
    if (!user) {
        return res.status(401).json({ success: false, message: 'Пользователь не найден' });
    }

    if (user.password !== password) {
        return res.status(401).json({ success: false, message: 'Неверный пароль' });
    }

    console.log(`Пользователь вошел в систему: ${email}`);
    res.json({ success: true, message: 'Вход выполнен успешно!' });
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
    console.log(`Файл с пользователями будет создан здесь: ${usersFile}`);
});
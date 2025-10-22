// Система авторизации
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        // Проверяем, есть ли сохраненная сессия
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.redirectToDashboard();
        }

        // Настраиваем форму входа
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.login();
            });
        }
    }

    login() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const db = this.getDatabase();
        const user = db.users.find(u => u.username === username && u.password === password);

        if (user) {
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.redirectToDashboard();
        } else {
            alert('Неверный логин или пароль');
        }
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }

    redirectToDashboard() {
        if (this.currentUser.role === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'student.html';
        }
    }

    getDatabase() {
        return JSON.parse(localStorage.getItem('educationPlatform')) || this.createDefaultDatabase();
    }

    createDefaultDatabase() {
        const defaultDB = {
            users: [
                {
                    id: 1,
                    username: 'admin',
                    password: 'admin123',
                    role: 'admin',
                    name: 'Администратор'
                },
                {
                    id: 2,
                    username: 'ivanov',
                    password: '123456',
                    role: 'student',
                    name: 'Иванов Алексей',
                    grade: '9',
                    subject: 'history'
                }
            ],
            students: [
                {
                    id: 2,
                    name: 'Иванов Алексей',
                    grade: '9',
                    subject: 'history',
                    username: 'ivanov',
                    password: '123456',
                    progress: []
                }
            ],
            theory: [
                {
                    id: 1,
                    subject: 'history',
                    grade: '9',
                    title: 'Восточные славяне',
                    content: 'Восточные славяне - крупная группа славянских племен, сформировавшаяся в VI-IX веках на Восточно-Европейской равнине...',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 2,
                    subject: 'history',
                    grade: '9', 
                    title: 'Образование Древнерусского государства',
                    content: 'Древнерусское государство сложилось в IX веке в результате объединения восточнославянских племен...',
                    createdAt: new Date().toISOString()
                }
            ],
            tasks: [
                {
                    id: 1,
                    subject: 'history',
                    grade: '9',
                    topic: 'Образование государства',
                    type: 'single',
                    question: 'В каком году произошло Крещение Руси?',
                    options: ['862 год', '882 год', '988 год', '1015 год'],
                    correctAnswers: [2],
                    answers: []
                },
                {
                    id: 2,
                    subject: 'history',
                    grade: '9',
                    topic: 'Восточные славяне',
                    type: 'multiple',
                    question: 'Какие племена относились к восточным славянам?',
                    options: ['Поляне', 'Древляне', 'Вятичи', 'Кривичи'],
                    correctAnswers: [0, 1, 2, 3],
                    answers: []
                }
            ]
        };

        localStorage.setItem('educationPlatform', JSON.stringify(defaultDB));
        return defaultDB;
    }
}

// Инициализация системы авторизации
const auth = new AuthSystem();

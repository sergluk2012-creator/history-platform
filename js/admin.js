class AdminPanel {
    constructor() {
        this.db = JSON.parse(localStorage.getItem('educationPlatform')) || {};
        this.currentTab = 'students';
        this.init();
    }

    init() {
        // Проверяем авторизацию
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser || currentUser.role !== 'admin') {
            window.location.href = 'login.html';
            return;
        }

        // Настраиваем вкладки
        this.setupTabs();
        
        // Загружаем данные
        this.loadStudents();
        this.loadTheory();
        this.loadTasks();
        this.loadStatistics();

        // Настраиваем формы
        this.setupForms();
    }

    setupTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });
    }

    switchTab(tabName) {
        // Скрываем все вкладки
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Убираем активный класс у кнопок
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Показываем нужную вкладку
        document.getElementById(tabName).classList.add('active');
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        this.currentTab = tabName;
    }

    setupForms() {
        // Форма добавления ученика
        const addStudentForm = document.getElementById('addStudentForm');
        if (addStudentForm) {
            addStudentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addStudent();
            });
        }

        // Форма добавления теории
        const addTheoryForm = document.getElementById('addTheoryForm');
        if (addTheoryForm) {
            addTheoryForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addTheory();
            });
        }

        // Форма добавления задания
        const addTaskForm = document.getElementById('addTaskForm');
        if (addTaskForm) {
            addTaskForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addTask();
            });
        }
    }

    addStudent() {
        const name = document.getElementById('studentName').value;
        const grade = document.getElementById('studentGrade').value;
        const subject = document.getElementById('studentSubject').value;

        // Генерируем логин и пароль
        const username = this.generateUsername(name);
        const password = this.generatePassword();

        const newStudent = {
            id: Date.now(),
            name: name,
            grade: grade,
            subject: subject,
            username: username,
            password: password,
            progress: []
        };

        // Добавляем в базу данных
        if (!this.db.students) this.db.students = [];
        this.db.students.push(newStudent);

        // Добавляем пользователя для входа
        if (!this.db.users) this.db.users = [];
        this.db.users.push({
            id: newStudent.id,
            username: username,
            password: password,
            role: 'student',
            name: name
        });

        this.saveDatabase();
        this.loadStudents();

        // Очищаем форму
        document.getElementById('addStudentForm').reset();

        alert(`Ученик добавлен!\nЛогин: ${username}\nПароль: ${password}`);
    }

    generateUsername(name) {
        const translit = {
            'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd',
            'е': 'e', 'ё': 'e', 'ж': 'zh', 'з': 'z', 'и': 'i',
            'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
            'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't',
            'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'c', 'ч': 'ch',
            'ш': 'sh', 'щ': 'sch', 'ы': 'y', 'э': 'e', 'ю': 'yu',
            'я': 'ya'
        };

        let username = name.toLowerCase().split(' ')[0];
        username = username.split('').map(char => translit[char] || char).join('');
        return username + '_' + Math.random().toString(36).substr(2, 3);
    }

    generatePassword() {
        return Math.random().toString(36).substr(2, 6);
    }

    loadStudents() {
        const tbody = document.getElementById('studentsList');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (!this.db.students || this.db.students.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">Нет добавленных учеников</td></tr>';
            return;
        }

        this.db.students.forEach(student => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.name}</td>
                <td>${student.grade} класс</td>
                <td>${student.subject === 'history' ? 'История' : 'Обществознание'}</td>
                <td>${student.username}</td>
                <td>${student.password}</td>
                <td>
                    <button class="btn btn-danger" onclick="admin.deleteStudent(${student.id})">Удалить</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    deleteStudent(studentId) {
        if (confirm('Вы уверены, что хотите удалить ученика?')) {
            this.db.students = this.db.students.filter(s => s.id !== studentId);
            this.db.users = this.db.users.filter(u => u.id !== studentId);
            this.saveDatabase();
            this.loadStudents();
        }
    }

    addTheory() {
        const subject = document.getElementById('theorySubject').value;
        const grade = document.getElementById('theoryGrade').value;
        const title = document.getElementById('theoryTitle').value;
        const content = document.getElementById('theoryContent').value;

        const newTheory = {
            id: Date.now(),
            subject: subject,
            grade: grade,
            title: title,
            content: content,
            createdAt: new Date().toISOString()
        };

        if (!this.db.theory) this.db.theory = [];
        this.db.theory.push(newTheory);

        this.saveDatabase();
        this.loadTheory();
        document.getElementById('addTheoryForm').reset();

        alert('Теоретический материал добавлен!');
    }

    loadTheory() {
        const container = document.getElementById('theoryList');
        if (!container) return;

        container.innerHTML = '';

        if (!this.db.theory || this.db.theory.length === 0) {
            container.innerHTML = '<p class="text-center">Нет добавленных материалов</p>';
            return;
        }

        this.db.theory.forEach(item => {
            const theoryItem = document.createElement('div');
            theoryItem.className = 'theory-item';
            theoryItem.innerHTML = `
                <h4>${item.title}</h4>
                <div class="theory-meta">
                    ${item.subject === 'history' ? 'История' : 'Обществознание'} | ${item.grade} класс
                </div>
                <p>${item.content.substring(0, 100)}...</p>
                <div class="mt-1">
                    <button class="btn" onclick="admin.editTheory(${item.id})">Редактировать</button>
                    <button class="btn btn-danger" onclick="admin.deleteTheory(${item.id})">Удалить</button>
                </div>
            `;
            container.appendChild(theoryItem);
        });
    }

    deleteTheory(theoryId) {
        if (confirm('Удалить этот материал?')) {
            this.db.theory = this.db.theory.filter(t => t.id !== theoryId);
            this.saveDatabase();
            this.loadTheory();
        }
    }

    addTask() {
        const type = document.getElementById('taskType').value;
        const subject = document.getElementById('taskSubject').value;
        const grade = document.getElementById('taskGrade').value;
        const topic = document.getElementById('taskTopic').value;
        const question = document.getElementById('taskQuestion').value;

        let options = [];
        let correctAnswers = [];

        if (type !== 'text') {
            const optionInputs = document.querySelectorAll('.option-input');
            const checkboxes = document.querySelectorAll('.correct-checkbox');
            
            optionInputs.forEach((input, index) => {
                if (input.value.trim()) {
                    options.push(input.value.trim());
                    if (checkboxes[index].checked) {
                        correctAnswers.push(index);
                    }
                }
            });
        } else {
            correctAnswers = [document.getElementById('correctAnswer').value];
        }

        const newTask = {
            id: Date.now(),
            type: type,
            subject: subject,
            grade: grade,
            topic: topic,
            question: question,
            options: options,
            correctAnswers: correctAnswers,
            answers: []
        };

        if (!this.db.tasks) this.db.tasks = [];
        this.db.tasks.push(newTask);

        this.saveDatabase();
        this.loadTasks();
        document.getElementById('addTaskForm').reset();

        alert('Задание создано!');
    }

    loadTasks() {
        const container = document.getElementById('tasksList');
        if (!container) return;

        container.innerHTML = '';

        if (!this.db.tasks || this.db.tasks.length === 0) {
            container.innerHTML = '<p class="text-center">Нет созданных заданий</p>';
            return;
        }

        this.db.tasks.forEach(task => {
            const taskItem = document.createElement('div');
            taskItem.className = 'task-item';
            taskItem.innerHTML = `
                <h4>${task.question}</h4>
                <div class="task-meta">
                    ${task.subject === 'history' ? 'История' : 'Обществознание'} | 
                    ${task.grade} класс | 
                    ${this.getTaskTypeName(task.type)}
                </div>
                <p>Тема: ${task.topic}</p>
                <div class="mt-1">
                    <button class="btn btn-danger" onclick="admin.deleteTask(${task.id})">Удалить</button>
                </div>
            `;
            container.appendChild(taskItem);
        });
    }

    getTaskTypeName(type) {
        const types = {
            'single': 'Одиночный выбор',
            'multiple': 'Множественный выбор',
            'text': 'Текстовый ответ'
        };
        return types[type] || type;
    }

    deleteTask(taskId) {
        if (confirm('Удалить это задание?')) {
            this.db.tasks = this.db.tasks.filter(t => t.id !== taskId);
            this.saveDatabase();
            this.loadTasks();
        }
    }

    loadStatistics() {
        this.loadGeneralStats();
        this.loadProgressTable();
    }

    loadGeneralStats() {
        const container = document.getElementById('generalStats');
        if (!container) return;

        const studentCount = this.db.students ? this.db.students.length : 0;
        const theoryCount = this.db.theory ? this.db.theory.length : 0;
        const taskCount = this.db.tasks ? this.db.tasks.length : 0;

        container.innerHTML = `
            <div class="stats-cards">
                <div class="stat-card">
                    <div class="stat-number">${studentCount}</div>
                    <div class="stat-label">Учеников</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${theoryCount}</div>
                    <div class="stat-label">Материалов</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${taskCount}</div>
                    <div class="stat-label">Заданий</div>
                </div>
            </div>
        `;
    }

    loadProgressTable() {
        const tbody = document.getElementById('progressTable');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (!this.db.students || this.db.students.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">Нет данных</td></tr>';
            return;
        }

        this.db.students.forEach(student => {
            const completedTasks = student.progress ? student.progress.length : 0;
            const correctAnswers = student.progress ? student.progress.filter(p => p.isCorrect).length : 0;
            const percentage = completedTasks > 0 ? Math.round((correctAnswers / completedTasks) * 100) : 0;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.name}</td>
                <td>${completedTasks}</td>
                <td>${percentage}%</td>
                <td>${this.getWeakTopics(student)}</td>
            `;
            tbody.appendChild(row);
        });
    }

    getWeakTopics(student) {
        if (!student.progress || student.progress.length === 0) return 'Нет данных';
        
        // Простая логика для определения слабых тем
        const topicErrors = {};
        student.progress.forEach(p => {
            if (!p.isCorrect) {
                topicErrors[p.topic] = (topicErrors[p.topic] || 0) + 1;
            }
        });

        const weakTopics = Object.entries(topicErrors)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 2)
            .map(([topic]) => topic);

        return weakTopics.join(', ') || 'Нет данных';
    }

    saveDatabase() {
        localStorage.setItem('educationPlatform', JSON.stringify(this.db));
    }
}

// Глобальные функции для кнопок
function addOption() {
    const container = document.getElementById('optionsContainer');
    const newOption = document.createElement('div');
    newOption.className = 'option-item';
    newOption.innerHTML = `
        <input type="text" placeholder="Вариант ответа" class="option-input">
        <input type="checkbox" class="correct-checkbox"> Правильный
    `;
    container.appendChild(newOption);
}

// Инициализация админ-панели
const admin = new AdminPanel();

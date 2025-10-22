class StudentPanel {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.db = JSON.parse(localStorage.getItem('educationPlatform')) || {};
        this.init();
    }

    init() {
        // Проверяем авторизацию
        if (!this.currentUser || this.currentUser.role !== 'student') {
            window.location.href = 'login.html';
            return;
        }

        this.setupStudentInfo();
        this.setupTabs();
        this.loadStudentData();
        this.setupModal();
    }

    setupStudentInfo() {
        const student = this.db.students.find(s => s.id === this.currentUser.id);
        if (student) {
            document.getElementById('studentInfo').textContent = 
                `${student.grade} класс, ${student.subject === 'history' ? 'История' : 'Обществознание'}`;
            document.getElementById('studentNameDisplay').textContent = student.name;
        }
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
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        document.getElementById(tabName).classList.add('active');
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Загружаем данные при переключении вкладок
        if (tabName === 'materials') {
            this.loadTheory();
        } else if (tabName === 'practice') {
            this.loadTasks();
        } else if (tabName === 'progress') {
            this.loadProgress();
        }
    }

    loadStudentData() {
        this.loadStats();
        this.loadTheory();
        this.loadTasks();
        this.loadProgress();
    }

    loadStats() {
        const student = this.db.students.find(s => s.id === this.currentUser.id);
        if (student) {
            const completedTasks = student.progress ? student.progress.length : 0;
            const correctAnswers = student.progress ? student.progress.filter(p => p.isCorrect).length : 0;
            const percentage = completedTasks > 0 ? Math.round((correctAnswers / completedTasks) * 100) : 0;
            const theoryRead = this.db.theory ? this.db.theory.filter(t => 
                t.grade === student.grade && t.subject === student.subject
            ).length : 0;

            document.getElementById('completedTasks').textContent = completedTasks;
            document.getElementById('correctPercentage').textContent = percentage + '%';
            document.getElementById('theoryRead').textContent = theoryRead;
        }
    }

    loadTheory() {
        const container = document.getElementById('studentTheoryList');
        if (!container) return;

        const student = this.db.students.find(s => s.id === this.currentUser.id);
        if (!student || !this.db.theory) {
            container.innerHTML = '<p>Нет доступных материалов</p>';
            return;
        }

        const studentTheory = this.db.theory.filter(t => 
            t.grade === student.grade && t.subject === student.subject
        );

        if (studentTheory.length === 0) {
            container.innerHTML = '<p>Нет доступных материалов для вашего класса и предмета</p>';
            return;
        }

        container.innerHTML = '';
        studentTheory.forEach(item => {
            const theoryItem = document.createElement('div');
            theoryItem.className = 'theory-item';
            theoryItem.innerHTML = `
                <h4>${item.title}</h4>
                <div class="theory-meta">
                    Добавлено: ${new Date(item.createdAt).toLocaleDateString()}
                </div>
                <p>${item.content}</p>
            `;
            container.appendChild(theoryItem);
        });
    }

    loadTasks() {
        const container = document.getElementById('studentTasksList');
        if (!container) return;

        const student = this.db.students.find(s => s.id === this.currentUser.id);
        if (!student || !this.db.tasks) {
            container.innerHTML = '<p>Нет доступных заданий</p>';
            return;
        }

        const studentTasks = this.db.tasks.filter(t => 
            t.grade === student.grade && t.subject === student.subject
        );

        // Фильтруем уже выполненные задания
        const completedTaskIds = student.progress ? student.progress.map(p => p.taskId) : [];
        const availableTasks = studentTasks.filter(t => !completedTaskIds.includes(t.id));

        if (availableTasks.length === 0) {
            container.innerHTML = '<p>Все доступные задания выполнены</p>';
            return;
        }

        container.innerHTML = '';
        availableTasks.forEach(task => {
            const taskItem = document.createElement('div');
            taskItem.className = 'task-item';
            taskItem.innerHTML = `
                <h4>${task.question}</h4>
                <div class="task-meta">
                    Тема: ${task.topic} | Тип: ${this.getTaskTypeName(task.type)}
                </div>
                <button class="btn btn-primary mt-1" onclick="studentPanel.openTask(${task.id})">
                    Выполнить задание
                </button>
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

    setupModal() {
        this.modal = document.getElementById('taskModal');
        this.closeBtn = document.querySelector('.close');
        
        this.closeBtn.addEventListener('click', () => {
            this.closeModal();
        });

        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });

        const answerForm = document.getElementById('taskAnswerForm');
        if (answerForm) {
            answerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitAnswer();
            });
        }
    }

    openTask(taskId) {
        const task = this.db.tasks.find(t => t.id === taskId);
        if (!task) return;

        this.currentTask = task;

        document.getElementById('modalTaskTitle').textContent = task.topic;
        document.getElementById('modalTaskContent').innerHTML = `
            <p><strong>Вопрос:</strong> ${task.question}</p>
        `;

        const answerInputs = document.getElementById('answerInputs');
        answerInputs.innerHTML = '';

        if (task.type === 'single') {
            task.options.forEach((option, index) => {
                const label = document.createElement('label');
                label.style.display = 'block';
                label.style.marginBottom = '0.5rem';
                label.innerHTML = `
                    <input type="radio" name="answer" value="${index}">
                    ${option}
                `;
                answerInputs.appendChild(label);
            });
        } else if (task.type === 'multiple') {
            task.options.forEach((option, index) => {
                const label = document.createElement('label');
                label.style.display = 'block';
                label.style.marginBottom = '0.5rem';
                label.innerHTML = `
                    <input type="checkbox" name="answer" value="${index}">
                    ${option}
                `;
                answerInputs.appendChild(label);
            });
        } else if (task.type === 'text') {
            answerInputs.innerHTML = `
                <input type="text" name="answer" class="form-group" style="width: 100%;" placeholder="Введите ваш ответ">
            `;
        }

        this.modal.style.display = 'block';
    }

    closeModal() {
        this.modal.style.display = 'none';
        this.currentTask = null;
    }

    submitAnswer() {
        if (!this.currentTask) return;

        const student = this.db.students.find(s => s.id === this.currentUser.id);
        if (!student) return;

        let userAnswer;
        let isCorrect = false;

        if (this.currentTask.type === 'single') {
            const selected = document.querySelector('input[name="answer"]:checked');
            userAnswer = selected ? parseInt(selected.value) : null;
            isCorrect = userAnswer === this.currentTask.correctAnswers[0];
        } else if (this.currentTask.type === 'multiple') {
            const selected = Array.from(document.querySelectorAll('input[name="answer"]:checked'))
                .map(cb => parseInt(cb.value));
            userAnswer = selected;
            isCorrect = JSON.stringify(selected.sort()) === JSON.stringify(this.currentTask.correctAnswers.sort());
        } else if (this.currentTask.type === 'text') {
            userAnswer = document.querySelector('input[name="answer"]').value;
            isCorrect = userAnswer.toLowerCase().trim() === this.currentTask.correctAnswers[0].toLowerCase().trim();
        }

        // Сохраняем результат
        if (!student.progress) student.progress = [];
        student.progress.push({
            taskId: this.currentTask.id,
            taskTopic: this.currentTask.topic,
            userAnswer: userAnswer,
            correctAnswer: this.currentTask.correctAnswers,
            isCorrect: isCorrect,
            completedAt: new Date().toISOString()
        });

        // Обновляем базу данных
        const studentIndex = this.db.students.findIndex(s => s.id === student.id);
        this.db.students[studentIndex] = student;
        localStorage.setItem('educationPlatform', JSON.stringify(this.db));

        this.closeModal();
        this.loadStudentData();

        if (isCorrect) {
            alert('Правильно! ✅');
        } else {
            alert('Неправильно. Попробуйте еще раз! ❌');
        }
    }

    loadProgress() {
        const container = document.getElementById('studentProgress');
        if (!container) return;

        const student = this.db.students.find(s => s.id === this.currentUser.id);
        if (!student || !student.progress || student.progress.length === 0) {
            container.innerHTML = '<p>Вы еще не выполнили ни одного задания</p>';
            return;
        }

        let html = '<h4>История выполнения:</h4>';
        
        student.progress.forEach((item, index) => {
            const status = item.isCorrect ? '✅ Правильно' : '❌ Неправильно';
            const date = new Date(item.completedAt).toLocaleDateString();
            
            html += `
                <div class="task-item">
                    <h5>Задание ${index + 1}</h5>
                    <p><strong>Тема:</strong> ${item.taskTopic}</p>
                    <p><strong>Результат:</strong> ${status}</p>
                    <p><strong>Дата:</strong> ${date}</p>
                </div>
            `;
        });

        container.innerHTML = html;
    }
}

// Инициализация личного кабинета
const studentPanel = new StudentPanel();

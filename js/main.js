// Общие вспомогательные функции
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем авторизацию на главной странице
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && window.location.pathname.endsWith('index.html')) {
        if (currentUser.role === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'student.html';
        }
    }
});

// Функция для выхода из системы
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// Добавляем обработчик выхода, если есть кнопка выхода
document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.querySelector('a[href="login.html"]');
    if (logoutBtn && localStorage.getItem('currentUser')) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
});
// Исправление кнопки выхода
document.addEventListener('DOMContentLoaded', function() {
    // Находим все кнопки выхода
    const logoutLinks = document.querySelectorAll('a[href="login.html"]');
    
    logoutLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            // Удаляем данные пользователя
            localStorage.removeItem('currentUser');
            // Перенаправляем на страницу входа
            window.location.href = 'login.html';
        });
    });
    
    // Добавляем красивый hover эффект для всех кнопок
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
});

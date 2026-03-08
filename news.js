// news.js

const API_URL = 'api/news.php'; // Предполагаемый путь к API новостей
const newsForm = document.getElementById('newsForm');
const statusEl = document.getElementById('newsStatus');
const refreshButton = document.getElementById('refreshNewsButton');
const newsListContainer = document.getElementById('newsListContainer');

// --- Вспомогательные функции для даты ---
function getISODateTime(date) {
    // Форматирует дату в ISO строку, необходимую для <input type="datetime-local">
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function setDefaultDateTime() {
    const now = new Date();
    // Устанавливаем дату на 1 час вперед
    now.setHours(now.getHours() + 1); 
    const datetimeInput = document.getElementById('post_datetime');
    if (datetimeInput) {
        datetimeInput.value = getISODateTime(now);
    }
}


// --- Логика ЗАГРУЗКИ и ОТОБРАЖЕНИЯ новостей ---
async function loadNews() {
    statusEl.textContent = 'Загрузка новостей...';
    statusEl.style.color = 'blue';
    newsListContainer.innerHTML = ''; 

    try {
        const response = await fetch(`${API_URL}?action=list`);
        if (!response.ok) throw new Error('Ошибка сети или API');

        const posts = await response.json();
        statusEl.textContent = `Загружено ${posts.length} новостей.`;
        statusEl.style.color = 'green';

        if (posts.length === 0) {
            newsListContainer.innerHTML = '<p>Нет опубликованных новостей.</p>';
            return;
        }

        const ul = document.createElement('ul');
        ul.className = 'news-list';
        
        posts.forEach(post => {
            const li = document.createElement('li');
            const isActive = post.active === true || post.active === 'true'; // Учитываем строковое значение
            const statusText = isActive ? 'Активно' : 'Неактивно';
            const toggleClass = isActive ? 'deactivate' : 'activate';
            const toggleText = isActive ? 'Деактивировать' : 'Активировать';

            li.innerHTML = `
                <div class="post-details">
                    <p><strong>ID: ${post.post_id}</strong> | Дата: ${post.post_datetime}</p>
                    <p>Название: ${post.title}</p>
                    <p>Ссылка: <a href="${post.url}" target="_blank">${post.url}</a></p>
                    <p>Статус: <span class="${isActive ? 'status-active' : 'status-inactive'}">${statusText}</span></p>
                </div>
                <button class="toggle-btn ${toggleClass}" data-id="${post.post_id}">${toggleText}</button>
            `;
            ul.appendChild(li);
        });
        newsListContainer.appendChild(ul);

    } catch (error) {
        console.error('Ошибка загрузки новостей:', error);
        statusEl.textContent = `Ошибка загрузки: ${error.message}`;
        statusEl.style.color = 'red';
    }
}


// --- Логика ИЗМЕНЕНИЯ СТАТУСА ---
async function handleNewsToggleClick(postId) {
    statusEl.textContent = `Меняем статус ${postId}...`;
    statusEl.style.color = 'blue';

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'toggle_status',
                post_id: postId
            })
        });
        
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        
        // Перезагружаем список, чтобы увидеть изменения
        await loadNews(); 

    } catch (error) {
        console.error('Ошибка изменения статуса:', error);
        statusEl.textContent = `Ошибка: ${error.message}`;
        statusEl.style.color = 'red';
    }
}


// --- Логика ОТПРАВКИ НОВОЙ НОВОСТИ ---
async function handleNewsSubmit(event) {
    event.preventDefault();
    statusEl.textContent = 'Отправка данных...';
    statusEl.style.color = 'blue';

    const formData = new FormData(newsForm);
    const data = Object.fromEntries(formData.entries());
    data.action = 'add_post';

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message);

        statusEl.textContent = 'Новость успешно добавлена.';
        statusEl.style.color = 'green';
        newsForm.reset();
        setDefaultDateTime(); // Сбрасываем дату на новую
        await loadNews();

    } catch (error) {
        console.error('Ошибка добавления новости:', error);
        statusEl.textContent = `Ошибка: ${error.message}`;
        statusEl.style.color = 'red';
    }
}

// --- Назначение обработчиков ---
document.addEventListener('DOMContentLoaded', () => {
    // Проверяем, что мы находимся на вкладке новостей
    if (newsForm && refreshButton && newsListContainer) {
        
        setDefaultDateTime();
        loadNews();

        newsForm.addEventListener('submit', handleNewsSubmit);
        refreshButton.addEventListener('click', loadNews);

        // Вешаем один "умный" обработчик на весь контейнер списка для переключения статуса
        newsListContainer.addEventListener('click', (event) => {
            if (event.target.classList.contains('toggle-btn')) {
                const postId = event.target.dataset.id;
                handleNewsToggleClick(postId);
            }
        });
    }
});
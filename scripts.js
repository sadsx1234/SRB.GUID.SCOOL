// scripts.js (ФИНАЛЬНЫЙ ОБЪЕДИНЕННЫЙ КОД)

// -----------------------------------------------------------
// === API КОНСТАНТЫ ===
// -----------------------------------------------------------
const NEWS_API_URL = 'api/news.php'; 
const SCHOOLS_API_URL = 'api/schools.php'; 
const SCHOOL_DETAIL_API_URL = 'api/school.php'; 


// -----------------------------------------------------------
// === ЭЛЕМЕНТЫ DOM ===
// -----------------------------------------------------------
const newsForm = document.getElementById('newsForm');
const statusEl = document.getElementById('newsStatus');
const refreshButton = document.getElementById('refreshNewsButton');
const newsListContainer = document.getElementById('newsListContainer');

const schoolStatus = document.getElementById('schoolStatus');
const schoolListContainer = document.getElementById('school-list-container');
const schoolList = document.getElementById('school-list');
const editFormContainer = document.getElementById('edit-form-container');
const refreshSchoolsButton = document.getElementById('refreshSchoolsButton');
const statusMessage = document.getElementById('status-message');


// --- Глобальные переменные для ШКОЛ ---
let currentSchoolId = null;
let activityDataCache = {}; 
const fileLabels = {
    'schools': 'Основные данные',
    'averageGrade': 'Оценки',
    'review': 'Отзывы и Summary',
    'students': 'Ученики',
    'addresses': 'Районы обслуживания',
    'activity_custom': 'Активности (кружки)'
};

const schoolKeyLabels = {
    'name': 'Название (Кириллица)',
    'nameLatin': 'Название (Латиница)',
    'city': 'Город',
    'place': 'Район/Поселок',
    'address': 'Адрес',
    'phone': 'Телефон',
    'email': 'Email',
    'type': 'Тип школы',
    'website': 'Сайт',
    'telegram': 'Telegram',
    'erasmus': 'Erasmus (да/нет/ссылка)',
    'eTwinning': 'eTwinning (да/нет/ссылка)',
    'boravak': 'Продленка (boravak)'
};


// -----------------------------------------------------------
// === ОБЩИЕ ФУНКЦИИ (ВКЛАДКИ И ПЕРЕКЛЮЧЕНИЕ) ===
// -----------------------------------------------------------

function switchMainTab(tabId) {
    // 1. Управление видимостью контента
    document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = 'none';
    });
    const activeContent = document.getElementById(tabId);
    if (activeContent) activeContent.style.display = 'block';

    // 2. Управление активностью кнопок
    document.querySelectorAll('.tabs .tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeBtn = document.querySelector(`.tabs .tab-button[data-tab="${tabId}"]`);
    if (activeBtn) activeBtn.classList.add('active');

    // 3. Запуск загрузчиков
    if (tabId === 'schoolsTab') {
        loadSchools();
    } else if (tabId === 'newsTab') {
        loadNews();
    }
}


// -----------------------------------------------------------
// === ЛОГИКА НОВОСТЕЙ (для полноты) ===
// -----------------------------------------------------------

function getISODateTime(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function setDefaultDateTime() {
    const now = new Date();
    now.setHours(now.getHours() + 1); 
    const datetimeInput = document.getElementById('post_datetime');
    if (datetimeInput) {
        datetimeInput.value = getISODateTime(now);
    }
}

async function loadNews() {
    if (!statusEl || !newsListContainer) return;
    statusEl.textContent = 'Загрузка новостей...';
    statusEl.style.color = 'blue';
    newsListContainer.innerHTML = ''; 

    try {
        const response = await fetch(`${NEWS_API_URL}?action=list`);
        if (!response.ok) throw new Error('Ошибка сети или API');
        const responseData = await response.json();
        const posts = responseData.news_items;
        
        if (!Array.isArray(posts)) {
            throw new Error("Неверный формат данных: ожидался массив в ключе 'news_items'.");
        }

        statusEl.textContent = `Загружено ${posts.length} новостей.`;
        statusEl.style.color = 'green';
        if (posts.length === 0) { newsListContainer.innerHTML = '<p>Нет опубликованных новостей.</p>'; return; }

        // Используем класс 'school-list' для стилизации
        const ul = document.createElement('ul');
        ul.className = 'school-list'; 
        
        posts.forEach(post => {
            const li = document.createElement('li');
            
            // Используем класс 'school-block' для стилизации
            li.className = 'school-block news-item-block'; 

            const title = post.title || post.content_text.substring(0, 100).trim() + '...';
            const link = post.url || post.cta_link;
            const datetime = post.post_datetime || post.publish_date || 'N/A';
            
            // Форматируем дату для лучшего отображения
            const dateOnly = datetime.split('T')[0];

            const isActive = post.active === true || post.active === 'true';
            const statusText = isActive ? 'Активно' : 'Неактивно';
            const toggleText = isActive ? 'Деактивировать' : 'Активировать';
            const toggleClass = isActive ? 'deactivate' : 'activate';

            li.innerHTML = `
                <div class="school-details news-details">
                    <div class="school-name-text">
                        <strong>${title}</strong>
                    </div>
                    <div class="school-info-details">
                        Дата: ${dateOnly} | Приоритет: ${post.priority || 'N/A'} | ID: ${post.post_id}
                    </div>
                    <div class="news-link-details">
                         Ссылка: <a href="${link}" target="_blank">${link.substring(0, 40)}...</a>
                    </div>
                </div>
                <button class="manage-btn toggle-btn ${toggleClass}" data-id="${post.post_id}">
                    ${toggleText}
                </button>
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

async function handleNewsToggleClick(postId) {
    if (!statusEl) return;
    statusEl.textContent = `Меняем статус ${postId}...`;
    statusEl.style.color = 'blue';

    try {
        const response = await fetch(NEWS_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'toggle_status', post_id: postId })
        });
        
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        await loadNews(); 

    } catch (error) {
        console.error('Ошибка изменения статуса:', error);
        statusEl.textContent = `Ошибка: ${error.message}`;
        statusEl.style.color = 'red';
    }
}

async function handleNewsSubmit(event) {
    event.preventDefault();
    if (!statusEl || !newsForm) return;

    statusEl.textContent = 'Отправка данных...';
    statusEl.style.color = 'blue';

    const formData = new FormData(newsForm);
    const data = Object.fromEntries(formData.entries());
    data.action = 'add_post';

    try {
        const response = await fetch(NEWS_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message);

        statusEl.textContent = 'Новость успешно добавлена. 🎉';
        statusEl.style.color = 'green';
        newsForm.reset();
        setDefaultDateTime();
        await loadNews();

    } catch (error) {
        console.error('Ошибка добавления новости:', error);
        statusEl.textContent = `Ошибка: ${error.message}`;
        statusEl.style.color = 'red';
    }
}


// -----------------------------------------------------------
// === ЛОГИКА ШКОЛ ===
// -----------------------------------------------------------

async function loadSchools() {
    if (!schoolStatus || !schoolList) return;

    schoolStatus.textContent = 'Загрузка списка школ...';
    schoolStatus.style.color = 'blue';
    
    const listApiUrl = SCHOOLS_API_URL; 

    try {
        const response = await fetch(listApiUrl);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Ошибка сервера ${response.status}. Проверьте console.log.`);
        }
        
        const schools = await response.json();
        
        if (!Array.isArray(schools)) {
             throw new Error("Неверный формат данных: API должен вернуть корневой массив [...].");
        }

        schoolList.innerHTML = ''; 
        
        if (schools.length === 0) {
            schoolList.innerHTML = '<li>Нет загруженных школ.</li>';
        } else {
            schools.forEach(school => {
                const listItem = document.createElement('li');
                listItem.className = 'school-block'; 
                
                const name = school.name || 'Название отсутствует';
                const city = school.city || 'N/A';
                const type = school.type || 'N/A';
                const address = school.address || 'N/A';
                const id = school.id || 'N/A';


                listItem.innerHTML = `
                    <div class="school-details">
                        <div class="school-name-text">
                            <strong>${name}</strong> (${city})
                        </div>
                        <div class="school-info-details">
                            Тип: ${type} | Адрес: ${address} | ID: ${id}
                        </div>
                    </div>
                    <button class="manage-btn" data-school-id="${id}">Управлять</button>
                `;
                schoolList.appendChild(listItem);
            });
        }

        schoolStatus.textContent = `Список школ загружен. (${schools.length} шт.)`;
        schoolStatus.style.color = 'green';
        if (statusMessage) statusMessage.textContent = '';


    } catch (error) {
        console.error('КРИТИЧЕСКАЯ ОШИБКА ЗАГРУЗКИ ШКОЛ:', error);
        schoolList.innerHTML = `<li>Произошла ошибка загрузки: ${error.message}</li>`;
        schoolStatus.textContent = `Ошибка: ${error.message}`;
        schoolStatus.style.color = 'red';
    }
}

async function loadSchoolData(id) {
    if (!schoolListContainer || !editFormContainer || !statusMessage) return; 
    
    document.getElementById('status-message').textContent = 'Загрузка данных...';
    document.getElementById('status-message').style.color = 'blue';

    try {
        const response = await fetch(`${SCHOOL_DETAIL_API_URL}?id=${id}`);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({error: 'Неизвестная ошибка сервера.'}));
            throw new Error(`Ошибка загрузки: ${errorData.error || 'Статус: ' + response.status}`);
        }
        
        const data = await response.json();

        // --- БЛОК: Переключение видимости ---
        schoolListContainer.style.display = 'none'; 
        editFormContainer.style.display = 'block'; 
        // ------------------------------------------

        currentSchoolId = id;
        document.getElementById('school-name').textContent = data.schools.name || `ID ${id}`;
        document.getElementById('status-message').textContent = '';

        // Здесь data содержит все ключи: schools, averageGrade, review, students, addresses, activity_full_list, activity_active_ids
        activityDataCache.fullList = data.activity_full_list || {};
        activityDataCache.activeIds = data.activity_active_ids || {};
        
        generateEditForm(data); 

    } catch (error) {
        console.error('КРИТИЧЕСКАЯ ОШИБКА loadSchoolData:', error);
        document.getElementById('status-message').textContent = `Ошибка загрузки данных: ${error.message}`;
        document.getElementById('status-message').style.color = 'red';
    }
}

/**
 * Генерирует HTML-форму для редактирования основных данных (вкладка 'schools').
 */
function generateSchoolsForm(data) {
    let html = '<form id="schoolsInnerForm">';
    
    const editableKeys = Object.keys(schoolKeyLabels);
    
    editableKeys.forEach(key => {
        let value = (data[key] === null || data[key] === undefined) ? '' : data[key]; 
        let label = schoolKeyLabels[key]; 
        let inputType = 'text';

        if (key === 'boravak') {
            const isChecked = value === true || value === 'true';
            html += `<div class="form-group checkbox-group">
                        <label for="input-${key}">${label}:</label>
                        <input type="checkbox" id="input-${key}" name="${key}" ${isChecked ? 'checked' : ''}>
                    </div>`;
        } else if (key === 'website' || key === 'telegram') {
             inputType = 'url';
        }

        if (key !== 'boravak') {
            html += `<div class="form-group">
                        <label for="input-${key}">${label}:</label>
                        <input type="${inputType}" id="input-${key}" name="${key}" value="${value}">
                    </div>`;
        }
    });

    html += '</form>';
    return html;
}

/**
 * Генерирует HTML для вкладки "Оценки"
 */
function generateGradeForm(data) {
    let html = '<form id="gradeInnerForm">';
    
    const gradeLabels = {
        'sixthGradeAverage': 'Средний балл 6 класс (0-20)',
        'seventhGradeAverage': 'Средний балл 7 класс (0-20)',
        'eighthGradeAverage': 'Средний балл 8 класс (0-20)',
        'totalAverageGrade': 'Общий средний балл (0-60)',
        'totalTestPointsAverage': 'Средний балл тестов (0-40)',
        'totalPoints': 'Итоговый балл (0-100)'
    };

    html += `<h4>Общая информация</h4>
             <p><strong>Школа:</strong> ${data.name || 'N/A'}</p>
             <p><strong>Количество учеников 8 класса:</strong> ${data.eighthGradeStudentsCount || 'N/A'}</p>
             <hr>`;

    Object.keys(gradeLabels).forEach(key => {
        let value = (data[key] === null || data[key] === undefined) ? '' : parseFloat(data[key]).toFixed(2);
        
        html += `<div class="form-group">
                    <label for="grade-input-${key}">${gradeLabels[key]}:</label>
                    <input type="number" step="0.01" id="grade-input-${key}" name="${key}" value="${value}">
                </div>`;
    });

    html += '</form>';
    return html;
}

/**
 * Генерирует HTML для вкладки "Ученики"
 */
function generateStudentsForm(data) {
    let html = '<form id="studentsInnerForm">';
    
    html += `<h4>Количество учеников по годам</h4>
             <p>Изменения вносятся в раздел students.json</p>
             <hr>`;
    
    if (data && data.students) {
        // data.students - это объект { "2024/25": 1113, ... }
        Object.keys(data.students).sort().reverse().forEach(year => { // Сортируем в обратном порядке
            let count = data.students[year] || '';
            
            html += `<div class="form-group">
                        <label for="students-input-${year}">Учеников ${year}:</label>
                        <input type="number" id="students-input-${year}" name="${year}" value="${count}">
                    </div>`;
        });
    } else {
        html += '<p>Данные о количестве учеников за последние годы отсутствуют.</p>';
    }

    html += '</form>';
    return html;
}

/**
 * Генерирует HTML для вкладки "Активности (кружки)"
 */
function generateActivityCheckboxes(fullList, activeIds) {
    let html = '<form id="activityInnerForm">';
    html += '<h3>Выберите активности, в которых участвует школа:</h3>';
    
    const categories = {};
    for (const id in fullList) {
        const activity = fullList[id];
        if (!categories[activity.category]) {
            categories[activity.category] = [];
        }
        categories[activity.category].push(activity);
    }
    
    if (Object.keys(categories).length === 0) {
        html += '<p class="warning-text">Список доступных активностей пуст. Проверьте activity.json.</p>';
    } else {
        for (const categoryName in categories) {
            html += `<h4>${categoryName}</h4><div class="activity-checkbox-group">`;
            
            categories[categoryName].forEach(activity => {
                const isChecked = activeIds[activity.id] === true;
                html += `<div class="form-group checkbox-group">
                            <input type="checkbox" id="activity-${activity.id}" name="activity_new_list[]" value="${activity.id}" ${isChecked ? 'checked' : ''}>
                            <label for="activity-${activity.id}">${activity.name}</label>
                         </div>`;
            });
            html += `</div>`;
        }
    }
    
    html += '<p class="warning-text">Внимание: здесь редактируется только список участия школы в существующих кружках.</p>';
    html += '</form>';
    return html;
}

/**
 * Генерирует форму редактирования с вкладками.
 */
function generateEditForm(data) {
    const form = document.getElementById('edit-form');
    const tabHeadersContainer = document.getElementById('tab-headers');
    
    form.innerHTML = '';
    tabHeadersContainer.innerHTML = '';
    
    const fileKeys = Object.keys(fileLabels);

    fileKeys.forEach((key, index) => {
        const tabId = `tab-${key}`;
        const tabName = fileLabels[key];

        const tabButton = document.createElement('button');
        tabButton.type = 'button';
        tabButton.className = (index === 0) ? 'tab-button active' : 'tab-button';
        tabButton.dataset.tabInner = tabId;
        tabButton.textContent = tabName;
        tabButton.onclick = () => switchInnerTab(tabId); 
        tabHeadersContainer.appendChild(tabButton);

        const tabContentDiv = document.createElement('div');
        tabContentDiv.id = tabId;
        tabContentDiv.className = (index === 0) ? 'tab-content inner-tab active' : 'tab-content inner-tab';
        
        // ⚠️ ГАРАНТИЯ ВИДИМОСТИ: Обеспечиваем, чтобы первая вкладка сразу была видна
        tabContentDiv.style.display = (index === 0) ? 'block' : 'none'; 
        
        if (key === 'schools') {
            tabContentDiv.innerHTML = generateSchoolsForm(data.schools); 
        } else if (key === 'averageGrade') {
             tabContentDiv.innerHTML = generateGradeForm(data.averageGrade);
        } else if (key === 'students') {
             tabContentDiv.innerHTML = generateStudentsForm(data.students);
        } else if (key === 'activity_custom') {
             tabContentDiv.innerHTML = generateActivityCheckboxes(data.activity_full_list, data.activity_active_ids);
        } else {
            tabContentDiv.innerHTML = `<p>Контент для вкладки "${tabName}" (пока не реализовано).</p>`;
        }
        
        form.appendChild(tabContentDiv);
    });
}

/**
 * Переключает внутренние вкладки в форме редактирования школы.
 */
function switchInnerTab(tabId) {
    document.querySelectorAll('#tab-headers .tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeBtn = document.querySelector(`.tab-headers .tab-button[data-tab-inner="${tabId}"]`);
    if (activeBtn) activeBtn.classList.add('active');

    // ⚠️ Управление контентом: Скрываем все, потом показываем нужный
    document.querySelectorAll('.inner-tab').forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none'; // Явное скрытие
    });
    
    const activeContent = document.getElementById(tabId);
    if (activeContent) {
        activeContent.classList.add('active');
        activeContent.style.display = 'block'; // Явный показ
    }
}

/**
 * Сохраняет данные школы, отправляя POST-запрос.
 */
async function saveSchoolData() {
    if (!currentSchoolId || !statusMessage) return;

    const activeTabContent = document.querySelector('.inner-tab.active');
    if (!activeTabContent) return;

    const tabKey = activeTabContent.id.replace('tab-', '');
    
    document.getElementById('status-message').textContent = `Сохранение данных для ${fileLabels[tabKey]}...`;
    document.getElementById('status-message').style.color = 'blue';

    let dataToSave = {
        action: 'update_school_data',
        id: currentSchoolId,
        file_key: tabKey, 
        data: {}
    };

    try {
        if (tabKey === 'schools') {
            const form = document.getElementById('schoolsInnerForm');
            const formData = new FormData(form);
            
            formData.forEach((value, key) => {
                dataToSave.data[key] = value;
            });
            
            dataToSave.data['boravak'] = formData.has('boravak');

            for (const key in dataToSave.data) {
                if (dataToSave.data[key] === '') {
                    dataToSave.data[key] = null;
                }
            }

        } else if (tabKey === 'averageGrade') {
            const form = document.getElementById('gradeInnerForm');
            const formData = new FormData(form);
            formData.forEach((value, key) => {
                dataToSave.data[key] = parseFloat(value) || 0; // Сохраняем как число
            });
        } else if (tabKey === 'students') {
            const form = document.getElementById('studentsInnerForm');
            const formData = new FormData(form);
            formData.forEach((value, key) => {
                dataToSave.data[key] = parseInt(value) || 0; // Сохраняем как целое число
            });
        } else if (tabKey === 'activity_custom') {
            // Здесь отправляем только список ID
            const form = document.getElementById('activityInnerForm');
            const formData = new FormData(form);
            const activeIds = [];
            formData.getAll('activity_new_list[]').forEach(id => activeIds.push(parseInt(id)));
            dataToSave.data = { active_activities: activeIds }; // Специальный формат для сохранения активностей
        } else {
            throw new Error(`Сохранение для вкладки "${fileLabels[tabKey]}" пока не реализовано.`);
        }

        const response = await fetch(SCHOOL_DETAIL_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataToSave)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Ошибка сервера при сохранении.');
        }

        document.getElementById('status-message').textContent = 'Данные успешно сохранены! 🎉';
        document.getElementById('status-message').style.color = 'green';
        
        await loadSchoolData(currentSchoolId); 

    } catch (error) {
        console.error('Ошибка сохранения данных:', error);
        document.getElementById('status-message').textContent = `Ошибка сохранения: ${error.message}`;
        document.getElementById('status-message').style.color = 'red';
    }
}

/**
 * Закрывает форму редактирования и возвращается к списку.
 */
function closeEditForm() {
    if (!schoolListContainer || !editFormContainer) return;
    editFormContainer.style.display = 'none';
    schoolListContainer.style.display = 'block';
    if (statusMessage) statusMessage.textContent = '';
    
    loadSchools();
}


// -----------------------------------------------------------
// === ИНИЦИАЛИЗАЦИЯ ===
// -----------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    setDefaultDateTime();
    
    // 2. ОБРАБОТЧИКИ ДЛЯ НОВОСТЕЙ
    if (newsForm) { newsForm.addEventListener('submit', handleNewsSubmit); }
    if (refreshButton) { refreshButton.addEventListener('click', loadNews); }
    if (newsListContainer) {
        newsListContainer.addEventListener('click', (event) => {
            if (event.target.classList.contains('toggle-btn')) {
                handleNewsToggleClick(event.target.dataset.id);
            }
        });
    }

    // 3. ОБРАБОТЧИКИ ДЛЯ ШКОЛ
    if (refreshSchoolsButton) { refreshSchoolsButton.addEventListener('click', loadSchools); }
    
    // 4. ГЛАВНЫЙ ОБРАБОТЧИК ДЛЯ КНОПКИ "УПРАВЛЯТЬ" (Делегирование событий)
    if (schoolList) {
        schoolList.addEventListener('click', (event) => {
            const target = event.target;
            
            if (target.classList.contains('manage-btn')) {
                const schoolId = target.dataset.schoolId;
                if (schoolId) {
                    loadSchoolData(schoolId); 
                }
            }
        });
    }

    // 5. ГЛАВНЫЙ ОБРАБОТЧИК ВКЛАДОК
    document.querySelectorAll('.tabs .tab-button').forEach(button => {
        button.addEventListener('click', () => {
            switchMainTab(button.dataset.tab);
        });
    });

    // 6. Первичная загрузка контента для АКТИВНОЙ вкладки при старте
    const initialTab = document.querySelector('.tabs .tab-button.active');
    if (initialTab) {
        switchMainTab(initialTab.dataset.tab); 
    }
});
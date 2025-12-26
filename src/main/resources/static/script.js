let themeToggle;

const body = document.body;
const globalBackButton = document.getElementById('global-back-button');
const theoryModal = document.getElementById('theory-modal');
const settingsModal = document.getElementById('settings-modal');

const theoryGrid = document.getElementById('theory-grid');
const theoryPage = document.getElementById('theory-page');
const theoryContent = document.getElementById('theory-content-container');
const taskSelectionGrid = document.getElementById('task-selection-grid');
const currentTaskNumberSpans = document.querySelectorAll('.current-task-number');
const currentTheoryNumberSpan = document.getElementById('current-theory-number');
const notification = document.getElementById('notification');

const taskSolverForm = document.getElementById('task-solver-form');
const taskInputArea = document.getElementById('task-input-area');

const resultTaskNumberSpans = document.querySelectorAll('#result-task-number, #result-task-number-h2');
const userTaskTextDiv = document.getElementById('user-task-text');
const aiResponseTextDiv = document.getElementById('ai-response-text');

// Переменные для Сайдбара
const sidebarMenu = document.getElementById('sidebar-menu');
const sidebarOverlay = document.getElementById('sidebar-overlay');

const IMAGE_TASKS = [1];
const SPREADSHEET_TASKS = [3, 9, 22];
const TEXTFILE_TASKS = [10, 17, 24, 26, 27];

let currentPage = 'main-page';
const pageHistory = ['main-page'];
let currentLanguage = 'ru';
let currentTask = null; // Хранит номер текущей задачи

document.addEventListener('DOMContentLoaded', function() {
    themeToggle = document.getElementById('theme-toggle');

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
    }
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            localStorage.setItem('theme', body.classList.contains('dark-mode') ? 'dark' : 'light');
        });
    }

    createButtons(theoryGrid, openTheoryPage);
    createButtons(taskSelectionGrid, openTaskInput);

    // НОВЫЙ ВЫЗОВ: Заполнение выпадающего списка задач 1-27
    generateTaskNumberOptions();

    updateBackButtonVisibility();

    if (taskSolverForm) {
        taskSolverForm.addEventListener('submit', function(e) {
            e.preventDefault();

            let textData = taskInputArea.value.trim();
            let fileData = '';
            let fileInput = null;

            if (IMAGE_TASKS.includes(currentTask)) {
                fileInput = document.querySelector('#task-input-image input');
            } else if (SPREADSHEET_TASKS.includes(currentTask)) {
                fileInput = document.querySelector('#task-input-spreadsheet input');
            } else if (TEXTFILE_TASKS.includes(currentTask)) {
                fileInput = document.querySelector('#task-input-textfile input');
            }

            if (fileInput && fileInput.files[0]) {
                // В реальном приложении здесь нужно отправить FormData на сервер для обработки файла
                fileData = fileInput.files[0].name;
            }

            if (!textData && !fileData) {
                showNotification('Введите условие задачи и/или выберите файл!', 'fas fa-exclamation-triangle');
                return;
            }

            let combinedTaskData = textData;
            if (fileData) {
                if (combinedTaskData) {
                    combinedTaskData += `\n\n(Файл: ${fileData} - Примечание: Файл не был загружен на сервер в этой версии API, отправлено только имя.)`;
                } else {
                    combinedTaskData = `(Файл: ${fileData} - Примечание: Файл не был загружен на сервер в этой версии API, отправлено только имя.)`;
                }
            }

            if (currentTask) {
                solveTask(currentTask, combinedTaskData);
            }
        });
    }

    if (settingsModal) {
        settingsModal.addEventListener('click', function(e) {
            if (e.target === settingsModal) {
                closeSettingsModal();
            }
        });
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeSidebar);
    }


    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (theoryModal.classList.contains('active')) {
                closeTheoryModal();
            }
            if (settingsModal.classList.contains('active')) {
                closeSettingsModal();
            }
            if (sidebarMenu.classList.contains('active')) {
                closeSidebar();
            }
        }
    });
});


function openSidebar() {
    sidebarMenu.classList.add('active');
    sidebarOverlay.classList.add('active');
}

function closeSidebar() {
    sidebarMenu.classList.remove('active');
    sidebarOverlay.classList.remove('active');
}

function toggleSidebar() {
    if (sidebarMenu.classList.contains('active')) {
        closeSidebar();
    } else {
        openSidebar();
    }
}


async function solveTask(taskNum, taskData) {
    showNotification(`Задание №${taskNum} отправлено на решение...`, 'fas fa-paper-plane');
    resultTaskNumberSpans.forEach(span => span.textContent = taskNum);
    userTaskTextDiv.innerHTML = '<div class="loader"></div>';
    aiResponseTextDiv.textContent = taskData;

    showPage('task-result-page');

    const payload = {
        taskNum: taskNum,
        request: taskData
    };

    try {
        const response = await fetch('ai/solve_task', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok || data.error) {
            const errorMessage = data.error || `Ошибка сети (HTTP ${response.status}).`;
            userTaskTextDiv.innerHTML = `<p style="color: red;">Ошибка: ${errorMessage}</p>`;
            showNotification(`Ошибка при решении задачи: ${errorMessage}`, 'fas fa-times-circle');

        } else {
            const aiResponse = data.result;

            const htmlResponse = marked.parse(aiResponse);

            userTaskTextDiv.innerHTML = htmlResponse;

            showNotification(`Задание №${taskNum} успешно решено!`, 'fas fa-check-circle');

            taskInputArea.value = '';
            if (document.querySelector('#task-input-image input')) {
                document.querySelector('#task-input-image input').value = null;
            }
            if (document.querySelector('#task-input-spreadsheet input')) {
                document.querySelector('#task-input-spreadsheet input').value = null;
            }
            if (document.querySelector('#task-input-textfile input')) {
                document.querySelector('#task-input-textfile input').value = null;
            }
        }

    } catch (error) {
        userTaskTextDiv.innerHTML = `<p style="color: red;">Критическая ошибка сети: ${error.message}. Убедитесь, что Python-бэкенд запущен по адресу 127.0.0.1:5000.</p>`;
        showNotification(`Критическая ошибка: ${error.message}`, 'fas fa-exclamation-triangle');
    }
}

function createButtons(container, onClickHandler) {
    container.innerHTML = '';
    const numTasks = 27;
    for (let i = 1; i <= numTasks; i++) {
        const button = document.createElement('button');
        button.className = 'theory-btn';
        button.textContent = i;
        button.onclick = () => onClickHandler(i);
        container.appendChild(button);
    }
}

// НОВАЯ ФУНКЦИЯ: Генерация опций для фильтра по номеру задачи
function generateTaskNumberOptions() {
    const select = document.getElementById('task-number-filter');
    if (select) {
        // Начинаем с 1, так как 'Все' уже есть в HTML
        for (let i = 1; i <= 27; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `Задание ${i}`;
            select.appendChild(option);
        }
    }
}

// НОВАЯ ФУНКЦИЯ: Заглушка для применения фильтров
function applyFilters() {
    const taskNumber = document.getElementById('task-number-filter').value;
    const difficultyCheckboxes = document.querySelectorAll('input[name="difficulty"]:checked');
    const authorCheckboxes = document.querySelectorAll('input[name="author"]:checked');

    const difficulties = Array.from(difficultyCheckboxes).map(cb => {
        if (cb.value === 'base') return 'Базовая';
        if (cb.value === 'medium') return 'Средняя';
        if (cb.value === 'hard') return 'Тяжелая';
        return '';
    });
    const authors = Array.from(authorCheckboxes).map(cb => {
        if (cb.value === 'fipi') return 'ФИПИ';
        if (cb.value === 'ezzege') return 'EzzEGE';
        return '';
    });

    const taskText = taskNumber === 'all' ? 'Все задания' : `Задание №${taskNumber}`;
    const difficultyText = difficulties.length ? difficulties.join(', ') : 'Любая';
    const authorText = authors.length ? authors.join(', ') : 'Любой';

    const filterSummary = `Выбранные фильтры: ${taskText}, Сложность: ${difficultyText}, Автор: ${authorText}`;

    // Выводим сообщение с примененными фильтрами
    showNotification(`Фильтры применены: ${filterSummary}`, 'fas fa-sliders-h');

    // В реальном приложении здесь будет логика загрузки и отображения задач
}

function copyEmail() {
    const email = 'friZerr4ik@yandex.ru';
    navigator.clipboard.writeText(email).then(() => {
        showNotification('Email скопирован в буфер обмена!', 'fas fa-check-circle');
    }).catch(() => {
        alert(`Email: ${email}\n\nСкопируйте email вручную`);
    });
    // Добавим скрытие модального окна настроек, если оно открыто
    closeSettingsModal();
}

function showNotification(message, iconClass) {
    notification.innerHTML = `<i class="${iconClass}"></i> ${message}`;
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function showPage(pageId, addToHistory = true) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    const newPage = document.getElementById(pageId);
    if (newPage) {
        newPage.classList.add('active');
        currentPage = pageId;

        if (addToHistory && pageHistory[pageHistory.length - 1] !== pageId) {
            pageHistory.push(pageId);
        }

        updateBackButtonVisibility();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function updateBackButtonVisibility() {
    if (currentPage !== 'main-page' || pageHistory.length > 1) {
        globalBackButton.style.display = 'flex';
    } else {
        globalBackButton.style.display = 'none';
    }
}

function handleBackNavigation() {
    if (pageHistory.length > 1) {
        pageHistory.pop();
        const prevPageId = pageHistory[pageHistory.length - 1];
        showPage(prevPageId, false);
    } else {
        goBackToMain();
    }
}

// goBackToMain просто переключает на главную, сбрасывая историю
function goBackToMain() {
    pageHistory.length = 1;
    showPage('main-page', false);
}

function openSettingsModal() {
    settingsModal.classList.add('active');
}

function closeSettingsModal() {
    settingsModal.classList.remove('active');
}

function toggleSettingsModal() {
    if (settingsModal.classList.contains('active')) {
        closeSettingsModal();
    } else {
        openSettingsModal();
    }
}

function openTheoryModal() {
    theoryModal.classList.add('active');
}

function closeTheoryModal() {
    theoryModal.classList.remove('active');
}

async function loadTheory(taskNum) {
    theoryContent.innerHTML = `<div class="loader"></div>`;

    const url = `https://raw.githubusercontent.com/ShustovRoman/PPhelp/main/file${taskNum}.html`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            let errorMessage = `Ошибка загрузки: файл не найден (статус ${response.status}).`;
            if (response.status === 404) {
                errorMessage += ` пока нет теории`;
            }
            throw new Error(errorMessage);
        }

        let text = await response.text();

        if (text.trim() === "") {
            theoryContent.innerHTML = `
                <h2>Теория: Задание ${taskNum}</h2>
                <p class="subtitle">SERVER_ERROR обратитесь позже</p>
            `;
        } else {
            theoryContent.innerHTML = text.trim();
            if (!theoryContent.querySelector('h2')) {
                theoryContent.insertAdjacentHTML('afterbegin', `<h2>Теория: Задание ${taskNum}</h2>`);
            }
        }

    } catch (error) {
        console.error('Ошибка загрузки теории:', error);
        theoryContent.innerHTML = `
            <h2>Ошибка загрузки</h2>
            <p class="subtitle"></p>
            <p style="color: red;"> ${error.message}</p>
        `;
    }
}

function openTheoryPage(taskNum) {
    currentTheoryNumberSpan.textContent = taskNum;
    loadTheory(taskNum);
    closeTheoryModal();
    showPage('theory-page');
}

function goToTaskSelection() {
    showPage('task-selection-page');
}

function goToTaskBank() {
    showPage('task-bank-page');
}

function openTaskInput(taskNum) {
    currentTask = taskNum;

    currentTaskNumberSpans.forEach(span => {
        span.textContent = taskNum;
    });

    const defaultInput = document.getElementById('task-input-default');
    const imageInput = document.getElementById('task-input-image');
    const spreadsheetInput = document.getElementById('task-input-spreadsheet');
    const textfileInput = document.getElementById('task-input-textfile');
    const subtitle = document.getElementById('task-input-subtitle');

    defaultInput.style.display = 'block';

    imageInput.style.display = 'none';
    spreadsheetInput.style.display = 'none';
    textfileInput.style.display = 'none';

    if (IMAGE_TASKS.includes(taskNum)) {
        imageInput.style.display = 'block';
        subtitle.textContent = 'Введите условие и загрузите изображение для этого задания.';
    } else if (SPREADSHEET_TASKS.includes(taskNum)) {
        spreadsheetInput.style.display = 'block';
        subtitle.textContent = 'Введите условие и загрузите файл электронной таблицы (.xls, .xlsx, .ods).';
    } else if (TEXTFILE_TASKS.includes(taskNum)) {
        textfileInput.style.display = 'block';
        subtitle.textContent = 'Введите условие и загрузите текстовый файл (.txt, .docx).';
    } else {
        subtitle.textContent = 'Введите условие вашей задачи в поле ниже.';
    }

    showPage('task-input-page');
}
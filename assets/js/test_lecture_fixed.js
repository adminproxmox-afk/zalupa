function resolveQuizQuestions(filePath) {
    const fallback = window.testLectureData && window.testLectureData[filePath];

    // Если данные уже есть в локальном объекте
    if (fallback && fallback.length > 0) {
        console.log(`[Quiz] Используем встроенные данные для: ${filePath}`);
        return Promise.resolve(fallback);
    }

    // Для файлового протокола используем XMLHttpRequest как fallback
    if (window.location.protocol === 'file:') {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', filePath, true);
            xhr.overrideMimeType('application/json');

            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status === 0 || xhr.status === 200) {
                        try {
                            const data = JSON.parse(xhr.responseText);
                            resolve(data);
                        } catch (e) {
                            console.error(`[Quiz] Ошибка парсинга JSON для ${filePath}:`, e);
                            if (fallback && fallback.length > 0) {
                                resolve(fallback);
                            } else {
                                reject(new Error(`Не удалось загрузить или распарсить ${filePath}`));
                            }
                        }
                    } else {
                        console.warn(`[Quiz] Не удалось загрузить ${filePath}, статус: ${xhr.status}`);
                        if (fallback && fallback.length > 0) {
                            resolve(fallback);
                        } else {
                            reject(new Error(`Не удалось загрузить ${filePath}`));
                        }
                    }
                }
            };

            xhr.onerror = function() {
                console.warn(`[Quiz] Network error для ${filePath}`);
                if (fallback && fallback.length > 0) {
                    resolve(fallback);
                } else {
                    reject(new Error(`Network error при загрузке ${filePath}`));
                }
            };

            xhr.send();
        });
    }

    // Для HTTP протокола используем стандартный fetch
    if (typeof window.fetch === 'function') {
        return fetch(filePath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: Не вдалося завантажити файл ${filePath}`);
                }
                return response.json();
            })
            .catch(error => {
                // Если fetch не удался и есть резервные данные
                if (fallback && fallback.length > 0) {
                    console.warn(`[Quiz] Fetch failed for ${filePath}, using fallback data:`, error.message);
                    return fallback;
                }
                // Если нет резервных данных, показываем ошибку
                console.error(`[Quiz] Failed to load ${filePath} and no fallback available:`, error);
                throw error;
            });
    }

    // Если fetch недоступен, используем резервные данные
    if (fallback && fallback.length > 0) {
        console.warn(`[Quiz] Fetch not available, using fallback data for ${filePath}`);
        return Promise.resolve(fallback);
    }

    return Promise.reject(new Error(`Неможливо завантажити ${filePath}: fetch недоступний і немає резервної копії`));
}

function createQuestion(questionData, index) {
    const questionDiv = document.createElement('div');
    questionDiv.classList.add('test-question');

    const questionText = document.createElement('p');
    questionText.textContent = questionData.question;
    questionDiv.appendChild(questionText);

    const optionsDiv = document.createElement('div');
    optionsDiv.classList.add('options');

    questionData.options.forEach((option, i) => {
        const label = document.createElement('label');
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = `question${index}`;
        input.value = String.fromCharCode(97 + i);
        label.appendChild(input);
        label.appendChild(document.createTextNode(option));
        optionsDiv.appendChild(label);
    });

    questionDiv.appendChild(optionsDiv);
    return questionDiv;
}

function checkAnswersSelected(form) {
    const submitButton = form.querySelector('.submit-btn');
    if (!submitButton) return;

    const inputs = form.querySelectorAll('input[type="radio"]');
    const isAnyChecked = Array.from(inputs).some(input => input.checked);
    submitButton.classList.toggle('active', isAnyChecked);
}

async function loadQuestionsFromFile(filePath, containerId, formId, resultId) {
    try {
        const questions = await resolveQuizQuestions(filePath);
        const container = document.getElementById(containerId);
        const form = document.getElementById(formId);
        const result = document.getElementById(resultId);

        if (!container || !form || !result) {
            throw new Error('Не знайдено контейнер для тесту');
        }

        container.innerHTML = '';
        result.innerHTML = '';

        questions.forEach((questionData, index) => {
            container.appendChild(createQuestion(questionData, index + 1));
        });

        form.dataset.questions = JSON.stringify(questions);
        form.dataset.resultId = resultId;
        return questions;
    } catch (error) {
        console.error('Помилка загрузки тесту:', error);

        // Показываем пользовательское сообщение об ошибке
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="quiz-error-message">
                    <h3>Помилка завантаження тесту</h3>
                    <p>Не вдалося завантажити тестові питання.</p>
                    <p>Деталі: ${error.message}</p>
                    <button onclick="location.reload()" class="submit-btn">Спробувати знову</button>
                </div>
            `;
        }
        return [];
    }
}

document.addEventListener('change', function (event) {
    if (event.target && event.target.type === 'radio' && event.target.closest('form')) {
        const form = event.target.closest('form');
        checkAnswersSelected(form);
    }
});

// Экспортируем функции для использования в других файлах
window.loadQuestionsFromFile = loadQuestionsFromFile;
window.resolveQuizQuestions = resolveQuizQuestions;
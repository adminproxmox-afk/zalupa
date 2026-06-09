function formatTime(seconds) {
    const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `${minutes}:${secs}`;
}

function saveQuizHistory(key, data) {
    const history = JSON.parse(localStorage.getItem('graphlyQuizHistory') || '{}');
    history[key] = data;
    localStorage.setItem('graphlyQuizHistory', JSON.stringify(history));
}

function getTopicRecommendations(mistakes) {
    const buckets = mistakes.reduce((acc, item) => {
        const topic = item.topic || 'Загальні поняття';
        acc[topic] = (acc[topic] || 0) + 1;
        return acc;
    }, {});

    return Object.keys(buckets).map(topic => `Повторіть: ${topic}`).join(', ');
}

function renderQuizAnalysis(mistakes) {
    if (!mistakes.length) return '';

    let html = '<div class="quiz-errors"><h3>Помилки:</h3><ul>';
    mistakes.forEach(item => {
        html += `<li><strong>${item.question}</strong><br>Ваш варіант: ${item.answer}<br>Правильний: ${item.correct}</li>`;
    });
    html += '</ul></div>';
    return html;
}

function clearActiveQuizTimer() {
    if (window.graphlyActiveQuizTimer) {
        clearInterval(window.graphlyActiveQuizTimer);
        window.graphlyActiveQuizTimer = null;
    }
}

function initQuizForm(formId, options = {}) {
    const form = document.getElementById(formId);
    if (!form || form.dataset.quizInit) return null;
    form.dataset.quizInit = 'true';

    const duration = Number(options.duration || form.dataset.quizDuration || 180);
    const meta = document.createElement('div');
    meta.className = 'quiz-meta';
    meta.innerHTML = `
        <div class="quiz-timer">Час: <span>${formatTime(duration)}</span></div>
        <div class="quiz-progress-line"><div class="quiz-progress-fill"></div></div>
    `;
    form.prepend(meta);

    const totalQuestions = form.querySelectorAll('.test-question').length;
    const progressFill = meta.querySelector('.quiz-progress-fill');
    const timerValue = meta.querySelector('.quiz-timer span');

    let timeLeft = duration;
    progressFill.style.width = '0%';

    const updateProgress = () => {
        const chosenAnswers = form.querySelectorAll('input[type="radio"]:checked').length;
        const percent = totalQuestions ? Math.round((chosenAnswers / totalQuestions) * 100) : 0;
        progressFill.style.width = `${percent}%`;
    };

    timerValue.textContent = formatTime(timeLeft);
    clearActiveQuizTimer();

    const interval = setInterval(() => {
        timeLeft -= 1;
        timerValue.textContent = formatTime(Math.max(timeLeft, 0));

        if (timeLeft <= 0) {
            clearInterval(interval);
            window.graphlyActiveQuizTimer = null;
            showToast('Час вичерпано! Тест автоматично надіслано.', 'warning');
            form.requestSubmit();
        }
    }, 1000);

    window.graphlyActiveQuizTimer = interval;

    form.addEventListener('change', updateProgress);
    updateProgress();

    const cleanup = () => {
        clearInterval(interval);
        if (window.graphlyActiveQuizTimer === interval) {
            window.graphlyActiveQuizTimer = null;
        }
    };

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        cleanup();
        updateProgress();

        const resultId = form.dataset.resultId;
        const result = document.getElementById(resultId);
        const questions = JSON.parse(form.dataset.questions || '[]');
        const formData = new FormData(this);
        let score = 0;
        const mistakes = [];

        questions.forEach((questionData, index) => {
            const answer = formData.get(`question${index + 1}`);
            if (answer === questionData.correct) {
                score += 1;
            } else {
                mistakes.push({
                    question: questionData.question,
                    correct: questionData.options[questionData.correct.charCodeAt(0) - 97],
                    answer: answer ? questionData.options[answer.charCodeAt(0) - 97] : 'Не вибрано',
                    topic: questionData.topic || 'Загальні поняття',
                });
            }
        });

        const percentage = questions.length ? Math.round((score / questions.length) * 100) : 0;
        const recommendations = getTopicRecommendations(mistakes);
        let html = `<div class="quiz-result-summary"><strong>Результат: ${score} з ${questions.length}</strong>`;
        html += `<p>Процент: ${percentage}%</p>`;

        if (mistakes.length) {
            html += renderQuizAnalysis(mistakes);
            html += `<p class="quiz-recommendation">${recommendations}</p>`;
        } else {
            html += '<p class="quiz-success">Вітаємо! Усі відповіді вірні.</p>';
        }

        html += '</div>';
        result.innerHTML = html;

        saveQuizHistory(resultId, {
            score,
            total: questions.length,
            percent: percentage,
            mistakes,
            timestamp: new Date().toISOString(),
        });

        showToast('Тест завершено. Результат оновлено.', 'success');
    });

    return cleanup;
}

function renderQuizCatalog() {
    const library = document.getElementById('quiz-library');
    if (!library) return;

    const catalog = window.graphlyQuizCatalog || [];
    library.innerHTML = '';

    catalog.forEach((item, index) => {
        const card = document.createElement('article');
        card.className = 'quiz-library-card';
        card.dataset.quizCard = item.id;
        card.innerHTML = `
            <div class="quiz-card-top">
                <span class="quiz-card-badge">${item.accent || `Блок ${index + 1}`}</span>
                <span class="quiz-card-count">${item.questionCount || 0} питань</span>
            </div>
            <h2>${item.title}</h2>
            <p class="quiz-card-subtitle">${item.subtitle || ''}</p>
            <p class="quiz-card-description">${item.description || ''}</p>
            <div class="quiz-card-footer">
                <span class="quiz-card-meta">${formatTime(item.duration || 180)}</span>
                <button type="button" class="submit-btn quiz-card-button">Почати блок</button>
            </div>
        `;

        const button = card.querySelector('button');
        button.addEventListener('click', () => openQuizBlock(item.id));
        card.addEventListener('click', event => {
            if (event.target === button) return;
            openQuizBlock(item.id);
        });

        library.appendChild(card);
    });
}

function setActiveCard(blockId) {
    document.querySelectorAll('[data-quiz-card]').forEach(card => {
        card.classList.toggle('is-active', card.dataset.quizCard === blockId);
    });
}

async function openQuizBlock(blockId) {
    const catalog = window.graphlyQuizCatalog || [];
    const block = catalog.find(item => item.id === blockId) || catalog[0];
    const stage = document.getElementById('quiz-stage');
    if (!block || !stage) return;

    clearActiveQuizTimer();
    setActiveCard(block.id);

    stage.innerHTML = `
        <article class="lecture-block test-question-block quiz-active-panel">
            <div class="quiz-stage-header">
                <div>
                    <p class="quiz-stage-kicker">${block.accent || 'Тестовий блок'}</p>
                    <h2 class="quiz-stage-title">${block.title}</h2>
                    <p class="quiz-stage-description">${block.description || ''}</p>
                </div>
                <div class="quiz-stage-meta">
                    <span>${block.subtitle || 'Підбірка питань'}</span>
                    <span>${block.questionCount || 0} питань</span>
                </div>
            </div>
            <form id="${block.formId}" data-result-id="${block.resultId}" data-quiz-duration="${block.duration || 180}">
                <div id="${block.containerId}" class="quiz-question-list"></div>
                <button type="submit" class="submit-btn">Перевірити відповіді</button>
            </form>
            <div id="${block.resultId}"></div>
        </article>
    `;

    await loadQuestionsFromFile(block.filePath, block.containerId, block.formId, block.resultId);
    initQuizForm(block.formId, { duration: block.duration || 180 });

    stage.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function initQuizPage() {
    renderQuizCatalog();
}

document.addEventListener('DOMContentLoaded', initQuizPage);

window.initQuizForm = initQuizForm;
window.openQuizBlock = openQuizBlock;

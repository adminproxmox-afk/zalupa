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

function renderQuizAnalysis(result, mistakes) {
    if (!mistakes.length) return '';
    let html = '<div class="quiz-errors"><h3>Помилки:</h3><ul>';
    mistakes.forEach(item => {
        html += `<li><strong>${item.question}</strong><br>Ваш варіант: ${item.answer}<br>Правильний: ${item.correct}</li>`;
    });
    html += '</ul></div>';
    return html;
}

function initQuizForm(formId) {
    const form = document.getElementById(formId);
    if (!form || form.dataset.quizInit) return;
    form.dataset.quizInit = 'true';

    const meta = document.createElement('div');
    meta.className = 'quiz-meta';
    meta.innerHTML = `
        <div class="quiz-timer">Час: <span>03:00</span></div>
        <div class="quiz-progress-line"><div class="quiz-progress-fill"></div></div>
    `;
    form.prepend(meta);

    const totalQuestions = form.querySelectorAll('.test-question').length;
    const progressFill = meta.querySelector('.quiz-progress-fill');
    const timerValue = meta.querySelector('.quiz-timer span');

    let timeLeft = 180;
    progressFill.style.width = '0%';
    timerValue.textContent = formatTime(timeLeft);

    const updateProgress = () => {
        const chosenAnswers = form.querySelectorAll('input[type="radio"]:checked').length;
        const percent = totalQuestions ? Math.round((chosenAnswers / totalQuestions) * 100) : 0;
        progressFill.style.width = `${percent}%`;
    };

    const interval = setInterval(() => {
        timeLeft -= 1;
        timerValue.textContent = formatTime(Math.max(timeLeft, 0));
        if (timeLeft <= 0) {
            clearInterval(interval);
            showToast('Час вичерпано! Тест автоматично надіслано.', 'warning');
            form.requestSubmit();
        }
    }, 1000);

    form.addEventListener('change', updateProgress);
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        clearInterval(interval);
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
            html += renderQuizAnalysis(result, mistakes);
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
}

window.initQuizForm = initQuizForm;

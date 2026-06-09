function resolveQuizQuestions(filePath) {
    const fallback = window.testLectureData && window.testLectureData[filePath];
    const shouldUseFallback = window.location.protocol === 'file:' || typeof window.fetch !== 'function';

    if (shouldUseFallback) {
        if (fallback) {
            return Promise.resolve(fallback);
        }
        return Promise.reject(new Error('Файл не знайдено у локальній резервній копії'));
    }

    return fetch(filePath)
        .then(response => {
            if (!response.ok) {
                throw new Error('Не вдалося завантажити файл');
            }
            return response.json();
        })
        .catch(error => {
            if (fallback) {
                console.warn('Fetch failed, using local fallback data:', error);
                return fallback;
            }
            throw error;
        });
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
        console.error('Помилка:', error);
        return [];
    }
}

document.addEventListener('change', function (event) {
    if (event.target && event.target.type === 'radio' && event.target.closest('form')) {
        const form = event.target.closest('form');
        checkAnswersSelected(form);
    }
});

window.loadQuestionsFromFile = loadQuestionsFromFile;
window.createQuestion = createQuestion;
window.checkAnswersSelected = checkAnswersSelected;

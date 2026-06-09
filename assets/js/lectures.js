function getLectureProgress() {
    return JSON.parse(localStorage.getItem('graphlyLectureProgress') || '{}');
}

function saveLectureProgress(progress) {
    localStorage.setItem('graphlyLectureProgress', JSON.stringify(progress));
}

function getLectureFavorites() {
    return JSON.parse(localStorage.getItem('graphlyLectureFavorites') || '{}');
}

function saveLectureFavorites(favorites) {
    localStorage.setItem('graphlyLectureFavorites', JSON.stringify(favorites));
}

function formatProgress(percent) {
    return `${Math.round(percent)}%`;
}

function getLectureEmptyState() {
    return document.getElementById('lecture-empty');
}

function renderLectureProgress() {
    const progress = getLectureProgress();
    document.querySelectorAll('.lecture-card').forEach(card => {
        const lectureId = card.dataset.lectureId;
        const percent = progress[lectureId] || 0;
        let progressBar = card.querySelector('.lecture-progress-bar');
        let label = card.querySelector('.lecture-progress-label');
        if (!progressBar) {
            const progressContainer = document.createElement('div');
            progressContainer.className = 'lecture-progress';
            progressContainer.innerHTML = `
                <div class="lecture-progress-track"><div class="lecture-progress-bar"></div></div>
                <div class="lecture-progress-label"></div>
            `;
            card.appendChild(progressContainer);
            progressBar = progressContainer.querySelector('.lecture-progress-bar');
            label = progressContainer.querySelector('.lecture-progress-label');
        }
        progressBar.style.width = `${percent}%`;
        label.textContent = percent ? `Завершено ${formatProgress(percent)}` : 'Не почато';
    });
}

function renderLectureFavorites() {
    const favorites = getLectureFavorites();
    document.querySelectorAll('.lecture-card').forEach(card => {
        const lectureId = card.dataset.lectureId;
        const favoriteButton = card.querySelector('.favorite-toggle');
        if (favoriteButton) {
            favoriteButton.classList.toggle('active', favorites[lectureId]);
            favoriteButton.setAttribute('aria-pressed', favorites[lectureId] ? 'true' : 'false');
            favoriteButton.setAttribute(
                'aria-label',
                favorites[lectureId] ? 'Прибрати з обраного' : 'Додати до обраного'
            );
        }
        if (favorites[lectureId]) {
            card.classList.add('lecture-card-favorite');
        } else {
            card.classList.remove('lecture-card-favorite');
        }
    });
}

function toggleLectureFavorite(lectureId) {
    const favorites = getLectureFavorites();
    favorites[lectureId] = !favorites[lectureId];
    saveLectureFavorites(favorites);
    renderLectureFavorites();
    updateLectureFilters();
    showToast(`Лекція ${favorites[lectureId] ? 'додана до вибраного' : 'видалена з вибраного'}.`, 'success');
}

function updateLectureFilters() {
    const searchInput = document.getElementById('lecture-search');
    const tags = document.querySelectorAll('.lecture-filter button');
    const cards = document.querySelectorAll('.lecture-card');
    const emptyState = getLectureEmptyState();
    const searchValue = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const activeTag = Array.from(tags).find(button => button.classList.contains('active'))?.dataset.category || 'all';
    let visibleCount = 0;

    cards.forEach(card => {
        const title = card.querySelector('.lecture-card-title').textContent.toLowerCase();
        const description = card.querySelector('.lecture-card-text').textContent.toLowerCase();
        const category = card.dataset.category;
        const isFavorite = card.classList.contains('lecture-card-favorite');
        const matchesText = !searchValue || title.includes(searchValue) || description.includes(searchValue);
        const matchesTag = activeTag === 'all' || (activeTag === 'favorite' ? isFavorite : category === activeTag);
        const isVisible = matchesText && matchesTag;
        card.style.display = isVisible ? 'grid' : 'none';
        if (isVisible) {
            visibleCount += 1;
        }
    });

    if (emptyState) {
        emptyState.hidden = visibleCount > 0;
    }
}

function initLectureSearch() {
    const searchInput = document.getElementById('lecture-search');
    if (searchInput) {
        searchInput.addEventListener('input', updateLectureFilters);
    }
    document.querySelectorAll('.lecture-filter button').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.lecture-filter button').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            updateLectureFilters();
        });
    });
}

function markLectureComplete(lectureId) {
    const progress = getLectureProgress();
    progress[lectureId] = 100;
    saveLectureProgress(progress);
    renderLectureProgress();
    showToast('Лекцію позначено як завершеною.', 'success');
}

function initLectureCardControls() {
    document.querySelectorAll('.favorite-toggle').forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            const card = button.closest('.lecture-card');
            if (!card) return;
            const lectureId = card.dataset.lectureId;
            toggleLectureFavorite(lectureId);
        });
    });
}

function initLecturePage() {
    const markButton = document.getElementById('mark-complete-btn');
    if (markButton) {
        const lectureId = markButton.dataset.lessonId;
        markButton.addEventListener('click', () => markLectureComplete(lectureId));
    }
    renderLectureProgress();
}

window.addEventListener('DOMContentLoaded', () => {
    initLectureSearch();
    initLectureCardControls();
    initLecturePage();
    renderLectureProgress();
    renderLectureFavorites();
    updateLectureFilters();
});

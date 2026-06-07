const GRAPHLY_THEME_KEY = 'graphly-theme';
const themeToggleLabel = {
  light: 'Включено світлу тему',
  dark: 'Включено темну тему',
};

function getSavedTheme() {
  return localStorage.getItem(GRAPHLY_THEME_KEY) ||
    (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(GRAPHLY_THEME_KEY, theme);
  const button = document.getElementById('theme-toggle');
  if (button) {
    button.setAttribute('aria-label', themeToggleLabel[theme]);
    button.innerHTML = theme === 'dark' ? '<i class="ri-sun-line"></i>' : '<i class="ri-moon-line"></i>';
  }
}

function toggleTheme() {
  const current = document.documentElement.dataset.theme;
  const nextTheme = current === 'dark' ? 'light' : 'dark';
  applyTheme(nextTheme);
  showToast(`Тема змінена на ${nextTheme === 'dark' ? 'темну' : 'світлу'}.`, 'success');
}

function mountThemeSwitcher() {
  const button = document.getElementById('theme-toggle');
  if (!button) return;
  button.addEventListener('click', toggleTheme);
}

function mountToasts() {
  if (document.querySelector('.toast-wrapper')) return;
  const wrapper = document.createElement('div');
  wrapper.className = 'toast-wrapper';
  wrapper.setAttribute('aria-live', 'polite');
  document.body.appendChild(wrapper);
}

function showToast(message, type = 'default', duration = 3800) {
  if (!document.body) return;
  mountToasts();
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  const wrapper = document.querySelector('.toast-wrapper');
  wrapper.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('toast--visible'));
  setTimeout(() => {
    toast.classList.remove('toast--visible');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, duration);
}

function initShellSkeleton() {
  document.documentElement.classList.add('has-skeleton');
  window.addEventListener('load', () => {
    document.documentElement.classList.remove('has-skeleton');
  });
}

function initPageTransition() {
  const pageContainer = document.querySelector('main.page-enter') || document.body;
  pageContainer.classList.add('page-enter');
  window.addEventListener('load', () => {
    pageContainer.classList.add('page-loaded');
    pageContainer.classList.remove('page-enter');
  });
  document.querySelectorAll('a[href$=".html"]').forEach(link => {
    if (link.target || link.dataset.noTransition) return;
    link.addEventListener('click', event => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('#')) return;
      event.preventDefault();
      pageContainer.classList.remove('page-loaded');
      pageContainer.classList.add('page-enter');
      setTimeout(() => window.location.assign(href), 220);
    });
  });
}

function initKeyboardShortcuts() {
  window.addEventListener('keydown', (event) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modKey = event.ctrlKey || event.metaKey;
    if (!modKey) return;

    if (event.key.toLowerCase() === 'z') {
      event.preventDefault();
      if (typeof window.undoAction === 'function') {
        window.undoAction();
      } else {
        showToast('Undo недоступний на цій сторінці.', 'warning');
      }
    }
    if (event.key.toLowerCase() === 'y' || (isMac && event.shiftKey && event.key.toLowerCase() === 'z')) {
      event.preventDefault();
      if (typeof window.redoAction === 'function') {
        window.redoAction();
      } else {
        showToast('Redo недоступний на цій сторінці.', 'warning');
      }
    }
    if (event.key.toLowerCase() === 's') {
      event.preventDefault();
      if (typeof window.exportGraph === 'function') {
        window.exportGraph();
      } else {
        showToast('Збереження доступне у редакторі графів.', 'default');
      }
    }
  });
}

window.addEventListener('DOMContentLoaded', () => {
  applyTheme(getSavedTheme());
  mountThemeSwitcher();
  mountToasts();
  initShellSkeleton();
  initPageTransition();
  initKeyboardShortcuts();
});

window.showToast = showToast;

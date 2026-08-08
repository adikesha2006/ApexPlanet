'use strict';

/* ==========================================================================
   Aditya Keshari — Portfolio Script
   Sections: Theme Toggle | Navigation | Header Line Visibility
             | Hero Typewriter | Project Catalog | Footer
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initFooterYear();
  initTheme();
  initNav();
  initHeaderLineVisibility();
  initTypewriter();
  initProjectCatalog();
  initContactForm();
});

/* ==========================================================================
   THEME TOGGLE (light / dark, persisted to localStorage)
   The initial theme is already applied by an inline script in <head> to
   avoid a flash of the wrong theme; this just wires up the toggle button.
   ========================================================================== */
const THEME_STORAGE_KEY = 'adityaTheme';

function initTheme() {
  const toggle = document.getElementById('themeToggle');
  if (!toggle) return;

  const root = document.documentElement;

  function reflectState(theme) {
    toggle.setAttribute('aria-pressed', String(theme === 'dark'));
    toggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  }

  reflectState(root.getAttribute('data-theme') || 'light');

  toggle.addEventListener('click', () => {
    const current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    reflectState(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch (error) {
      console.error('Could not persist theme preference:', error);
    }
  });
}

/* ==========================================================================
   FOOTER YEAR
   ========================================================================== */
function initFooterYear() {
  const yearEl = document.getElementById('footerYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

/* ==========================================================================
   NAVIGATION (mobile toggle + close-on-link-click)
   ========================================================================== */
function initNav() {
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('navMenu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  menu.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ==========================================================================
   HEADER LINE VISIBILITY
   The gradient underline beneath the nav is a "first page only" marker: it
   shows while the hero is in view and disappears once the person has
   scrolled down into About / Education / etc.
   ========================================================================== */
function initHeaderLineVisibility() {
  const header = document.getElementById('siteHeader');
  const hero = document.getElementById('top');
  if (!header || !hero || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        header.classList.toggle('header-line-hidden', !entry.isIntersecting);
      });
    },
    { threshold: 0, rootMargin: '-1px 0px 0px 0px' }
  );

  observer.observe(hero);
}

/* ==========================================================================
   HERO TYPEWRITER (signature console animation)
   ========================================================================== */
function initTypewriter() {
  const lineEl = document.getElementById('typewriterLine');
  const caretEl = document.getElementById('consoleCaret');
  if (!lineEl) return;

  const fullText = 'System.out.println("Hello World, I\'m Aditya Keshari");';
  let index = 0;
  let deleting = false;

  function tick() {
    if (!deleting) {
      lineEl.textContent = fullText.slice(0, index + 1);
      index += 1;
      if (index === fullText.length) {
        deleting = false;
        setTimeout(() => {
          deleting = true;
          tick();
        }, 2200);
        return;
      }
    } else {
      lineEl.textContent = fullText.slice(0, index - 1);
      index -= 1;
      if (index <= 0) {
        deleting = false;
        setTimeout(tick, 500);
        return;
      }
    }
    setTimeout(tick, deleting ? 30 : 55);
  }

  // Respect reduced motion preference: render final state without animating.
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    lineEl.textContent = fullText;
    if (caretEl) caretEl.style.display = 'none';
    return;
  }

  tick();
}

/* ==========================================================================
   PROJECT CATALOG (search + tag filter + sort, no reload)
   ========================================================================== */

const PROJECT_ICONS = {
  farmify: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 3c3 3 5 6 5 9a5 5 0 0 1-10 0c0-3 2-6 5-9Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M12 21v-6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  layout: '<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M3 9h18" stroke="currentColor" stroke-width="1.6"/></svg>',
  dashboard: '<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="9" rx="1.5" stroke="currentColor" stroke-width="1.6"/><rect x="14" y="3" width="7" height="5" rx="1.5" stroke="currentColor" stroke-width="1.6"/><rect x="14" y="12" width="7" height="9" rx="1.5" stroke="currentColor" stroke-width="1.6"/><rect x="3" y="16" width="7" height="5" rx="1.5" stroke="currentColor" stroke-width="1.6"/></svg>',
  cloud: '<svg viewBox="0 0 24 24" fill="none"><path d="M7 18a4 4 0 0 1-.5-7.97A5 5 0 0 1 16.2 8.1 4.5 4.5 0 0 1 16.5 18H7Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
  notebook: '<svg viewBox="0 0 24 24" fill="none"><path d="M6 3h11a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" stroke="currentColor" stroke-width="1.6"/><path d="M9 8h6M9 12h6M9 16h3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  checklist: '<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="m6.5 8.5 1.3 1.3L10.5 7M6.5 14.5l1.3 1.3 2.7-2.8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M13 8h6M13 15h6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
};

const PROJECTS = [
  {
    id: 'farmify',
    title: 'Farmify',
    description: 'A full-stack agricultural tech platform connecting farmers directly to buyers, with soil testing requests, subsidy tracking, and machinery rental — built with Node.js, Express, SQLite, and JWT auth.',
    tags: ['java', 'backend', 'api'],
    date: '2026-02-10',
    icon: 'farmify',
    link: '#'
  },
  {
    id: 'basics-showcase',
    title: 'Basics Showcase',
    description: 'Task 1 architecture — a foundational front-end build demonstrating clean semantic HTML structure and core CSS layout principles.',
    tags: ['frontend'],
    date: '2025-11-04',
    icon: 'layout',
    link: '#'
  },
  {
    id: 'interactive-dashboard',
    title: 'Interactive Dashboard & Validation Engine',
    description: 'Task 2 engine — a dynamic dashboard with real-time form validation logic, DOM state management, and reusable UI components.',
    tags: ['frontend', 'java'],
    date: '2025-12-18',
    icon: 'dashboard',
    link: '#'
  },
  {
    id: 'weather-telemetry',
    title: 'Async Weather Telemetry & Assessment Portal',
    description: 'Task 3 engine — an asynchronous fetch pipeline pulling live coordinate-based weather data, with defensive try/catch error handling and dynamic DOM rendering.',
    tags: ['api', 'frontend'],
    date: '2026-01-22',
    icon: 'cloud',
    link: '#'
  },
  {
    id: 'dev-notebook',
    title: 'Persistent Dev-Notebook Module',
    description: 'Task 4 LocalStorage engine — a full CRUD notebook that stringifies and parses structured note objects for persistent, reload-proof storage.',
    tags: ['storage', 'frontend'],
    date: '2026-03-05',
    icon: 'notebook',
    link: '#'
  },
  {
    id: 'taskflow',
    title: 'TaskFlow',
    description: 'A clean, fast to-do list app for organizing daily tasks — add, complete, and delete items with instant localStorage persistence and zero backend dependency.',
    tags: ['frontend', 'storage'],
    date: '2026-04-12',
    icon: 'checklist',
    link: '#'
  }
];

function initProjectCatalog() {
  const grid = document.getElementById('projectsGrid');
  const emptyState = document.getElementById('projectsEmpty');
  const searchInput = document.getElementById('projectSearch');
  const sortSelect = document.getElementById('projectSort');
  const tagFilters = document.getElementById('tagFilters');
  if (!grid) return;

  let activeTag = 'all';
  let sortMode = 'chronological';
  let searchTerm = '';

  function render() {
    let items = PROJECTS.filter((project) => {
      const matchesTag = activeTag === 'all' || project.tags.includes(activeTag);
      const haystack = (project.title + ' ' + project.description + ' ' + project.tags.join(' ')).toLowerCase();
      const matchesSearch = haystack.includes(searchTerm.toLowerCase());
      return matchesTag && matchesSearch;
    });

    items = items.slice().sort((a, b) => {
      if (sortMode === 'alphabetical') {
        return a.title.localeCompare(b.title);
      }
      return new Date(b.date) - new Date(a.date);
    });

    grid.innerHTML = '';

    if (items.length === 0) {
      emptyState.hidden = false;
    } else {
      emptyState.hidden = true;
      const fragment = document.createDocumentFragment();
      items.forEach((project) => fragment.appendChild(buildProjectCard(project)));
      grid.appendChild(fragment);
    }
  }

  function buildProjectCard(project) {
    const card = document.createElement('article');
    card.className = 'project-card';

    const formattedDate = new Date(project.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });

    const tagsMarkup = project.tags
      .map((tag) => `<span class="project-tag">#${escapeHtml(tag)}</span>`)
      .join('');

    card.innerHTML = `
      <div class="project-card-top">
        <span class="project-icon" aria-hidden="true">${PROJECT_ICONS[project.icon] || ''}</span>
        <span class="project-date">${formattedDate}</span>
      </div>
      <h3>${escapeHtml(project.title)}</h3>
      <p>${escapeHtml(project.description)}</p>
      <div class="project-tags">${tagsMarkup}</div>
      <a class="project-link" href="${project.link}">
        Explore module
        <svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </a>
    `;
    return card;
  }

  if (searchInput) {
    searchInput.addEventListener('input', (event) => {
      searchTerm = event.target.value.trim();
      render();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', (event) => {
      sortMode = event.target.value;
      render();
    });
  }

  if (tagFilters) {
    tagFilters.addEventListener('click', (event) => {
      const button = event.target.closest('.tag-pill');
      if (!button) return;
      tagFilters.querySelectorAll('.tag-pill').forEach((pill) => pill.classList.remove('is-active'));
      button.classList.add('is-active');
      activeTag = button.dataset.tag;
      render();
    });
  }

  render();
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* ==========================================================================
   CONTACT FORM (Web3Forms — key-based email delivery, no backend needed)
   ========================================================================== */

const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';

function initContactForm() {
  const form = document.getElementById('contactForm');
  const submitBtn = document.getElementById('contactSubmit');
  const submitText = document.getElementById('contactSubmitText');
  const statusEl = document.getElementById('contactFormStatus');
  const honeypot = document.getElementById('botcheck');
  if (!form || !statusEl) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Honeypot tripped: silently drop the submission without alerting the bot.
    if (honeypot && honeypot.checked) {
      return;
    }

    setLoadingState(true);
    setStatus('', null);

    try {
      const payload = Object.fromEntries(new FormData(form).entries());

      const response = await fetch(WEB3FORMS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        form.reset();
        setStatus('Message sent — thanks for reaching out! I\u2019ll reply soon.', 'success');
      } else {
        throw new Error(result.message || 'The message could not be delivered.');
      }
    } catch (error) {
      console.error('Contact form submission error:', error);
      setStatus('Something went wrong sending that. Please try again or email me directly.', 'error');
    } finally {
      setLoadingState(false);
    }
  });

  function setLoadingState(isLoading) {
    if (!submitBtn || !submitText) return;
    submitBtn.disabled = isLoading;
    submitText.innerHTML = isLoading
      ? '<span class="spinner" aria-hidden="true"></span> Sending…'
      : 'Send Message \u2192';
  }

  function setStatus(message, kind) {
    statusEl.textContent = message;
    statusEl.classList.remove('is-success', 'is-error');
    if (kind) statusEl.classList.add(`is-${kind}`);
  }
}
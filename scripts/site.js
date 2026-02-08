const toggle = document.querySelector('.theme-toggle');
const icon = toggle?.querySelector('.theme-toggle__icon');
const stored = localStorage.getItem('theme');
const themes = ['heritage', 'editorial', 'brutalist'];
const initial = themes.includes(stored || '') ? stored : 'heritage';
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.documentElement.dataset.theme = initial;
document.documentElement.classList.add('js');

const updateToggle = () => {
  const current = document.documentElement.dataset.theme;
  const label = current ? `Theme: ${current}. Activate to cycle theme.` : 'Activate to cycle theme.';
  toggle?.setAttribute('aria-label', label);
  toggle?.setAttribute('title', `Current theme: ${current}`);
  if (icon) {
    const shorthand = {
      heritage: 'H',
      editorial: 'E',
      brutalist: 'B',
    };
    icon.textContent = shorthand[current] || 'T';
  }
};

const setCurrentYear = () => {
  const year = String(new Date().getFullYear());
  document.querySelectorAll('[data-current-year]').forEach((node) => {
    node.textContent = year;
  });
};

updateToggle();
setCurrentYear();

const setupNavSnap = () => {
  const nav = document.querySelector('.nav-links');
  if (!nav) {
    return;
  }

  const links = Array.from(nav.querySelectorAll('a'));
  if (!links.length) {
    return;
  }

  let indicator = nav.querySelector('.nav-pill-indicator');
  if (!indicator) {
    indicator = document.createElement('span');
    indicator.className = 'nav-pill-indicator';
    indicator.setAttribute('aria-hidden', 'true');
    nav.prepend(indicator);
  }

  const activeLink = nav.querySelector('a[aria-current="page"]') || links[0];
  if (!activeLink) {
    return;
  }

  const navRect = nav.getBoundingClientRect();
  const activeRect = activeLink.getBoundingClientRect();
  const x = activeRect.left - navRect.left;

  indicator.style.width = `${activeRect.width}px`;
  indicator.style.transform = `translateX(${x}px)`;
};

const setupPageTransitions = () => {
  // Wait two frames so initial state is fully committed before animating in.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.body.classList.add('page-ready');
    });
  });

  if (reduceMotion) {
    return;
  }

  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    const link = event.target.closest('a');
    if (!link) {
      return;
    }

    const href = link.getAttribute('href');
    if (!href || href.startsWith('#')) {
      return;
    }

    if (link.target === '_blank' || link.hasAttribute('download')) {
      return;
    }

    const url = new URL(link.href, window.location.href);
    if (url.origin !== window.location.origin) {
      return;
    }

    if (url.pathname === window.location.pathname && url.search === window.location.search) {
      return;
    }

    event.preventDefault();
    document.body.classList.add('is-leaving');
    window.setTimeout(() => {
      window.location.href = url.href;
    }, 185);
  });
};

setupNavSnap();
setupPageTransitions();

window.addEventListener('resize', setupNavSnap);
window.addEventListener('load', setupNavSnap);

toggle?.addEventListener('click', () => {
  const current = document.documentElement.dataset.theme;
  const index = themes.indexOf(current);
  const next = themes[(index + 1) % themes.length];
  document.documentElement.dataset.theme = next;
  localStorage.setItem('theme', next);
  updateToggle();
});

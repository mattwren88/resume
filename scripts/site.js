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

  // Create main indicator (stays on active page)
  let indicator = nav.querySelector('.nav-pill-indicator');
  if (!indicator) {
    indicator = document.createElement('span');
    indicator.className = 'nav-pill-indicator';
    indicator.setAttribute('aria-hidden', 'true');
    nav.prepend(indicator);
  }

  // Create ghost indicator (moves on hover)
  let ghost = nav.querySelector('.nav-pill-ghost');
  if (!ghost) {
    ghost = document.createElement('span');
    ghost.className = 'nav-pill-ghost';
    ghost.setAttribute('aria-hidden', 'true');
    nav.prepend(ghost);
  }

  const updatePill = (pill, targetLink, noTransition = false) => {
    const navRect = nav.getBoundingClientRect();
    const targetRect = targetLink.getBoundingClientRect();
    const x = targetRect.left - navRect.left;

    if (noTransition) {
      const currentTransition = pill.style.transition;
      pill.style.transition = 'none';
      pill.style.width = `${targetRect.width}px`;
      pill.style.transform = `translateX(${x}px)`;
      // Force reflow to apply the no-transition state
      pill.offsetHeight;
      pill.style.transition = currentTransition;
    } else {
      pill.style.width = `${targetRect.width}px`;
      pill.style.transform = `translateX(${x}px)`;
    }
  };

  const activeLink = nav.querySelector('a[aria-current="page"]') || links[0];
  if (!activeLink) {
    return;
  }

  // Check if we're coming from a navigation click
  const previousPageUrl = sessionStorage.getItem('nav-previous-page');
  if (previousPageUrl) {
    sessionStorage.removeItem('nav-previous-page');

    // Find the link that matches the previous page
    const previousLink = links.find(link => {
      try {
        const linkUrl = new URL(link.href, window.location.href);
        const prevUrl = new URL(previousPageUrl, window.location.href);
        return linkUrl.pathname === prevUrl.pathname;
      } catch {
        return false;
      }
    });

    if (previousLink && previousLink !== activeLink) {
      // Start at previous link position (no transition)
      updatePill(indicator, previousLink, true);
      // Animate to active link position
      requestAnimationFrame(() => {
        updatePill(indicator, activeLink);
      });
    } else {
      // Just set position (no animation)
      updatePill(indicator, activeLink, true);
    }
  } else {
    // Initial load or direct visit, no animation
    updatePill(indicator, activeLink, true);
  }

  // Show ghost pill on hover
  links.forEach((link) => {
    link.addEventListener('mouseenter', () => {
      ghost.classList.add('is-visible');
      updatePill(ghost, link);
    });
  });

  // Hide ghost pill when mouse leaves nav
  nav.addEventListener('mouseleave', () => {
    ghost.classList.remove('is-visible');
  });

  // Store current page when clicking nav links
  links.forEach((link) => {
    link.addEventListener('click', () => {
      const href = link.getAttribute('href');
      if (href && !href.startsWith('#')) {
        try {
          const url = new URL(link.href, window.location.href);
          if (url.origin === window.location.origin) {
            // Store the current page URL so next page knows where we came from
            sessionStorage.setItem('nav-previous-page', window.location.href);
          }
        } catch {}
      }
    });
  });
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
    }, 160);
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

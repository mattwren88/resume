const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.documentElement.classList.add('js');

const setCurrentYear = () => {
  const year = String(new Date().getFullYear());
  document.querySelectorAll('[data-current-year]').forEach((node) => {
    node.textContent = year;
  });
};

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

  const previousPageUrl = sessionStorage.getItem('nav-previous-page');
  if (previousPageUrl) {
    sessionStorage.removeItem('nav-previous-page');

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
      updatePill(indicator, previousLink, true);
      requestAnimationFrame(() => {
        updatePill(indicator, activeLink);
      });
    } else {
      updatePill(indicator, activeLink, true);
    }
  } else {
    updatePill(indicator, activeLink, true);
  }

  links.forEach((link) => {
    link.addEventListener('mouseenter', () => {
      ghost.classList.add('is-visible');
      updatePill(ghost, link);
    });
  });

  nav.addEventListener('mouseleave', () => {
    ghost.classList.remove('is-visible');
  });

  links.forEach((link) => {
    link.addEventListener('click', () => {
      const href = link.getAttribute('href');
      if (href && !href.startsWith('#')) {
        try {
          const url = new URL(link.href, window.location.href);
          if (url.origin === window.location.origin) {
            sessionStorage.setItem('nav-previous-page', window.location.href);
          }
        } catch {}
      }
    });
  });
};

const setupPageTransitions = () => {
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

const setupScrollReveal = () => {
  if (reduceMotion) return;

  const sections = document.querySelectorAll('.page-content > *:nth-child(n+3)');
  sections.forEach((el) => el.classList.add('scroll-reveal'));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  sections.forEach((el) => observer.observe(el));
};

setupNavSnap();
setupPageTransitions();
setupScrollReveal();

window.addEventListener('resize', setupNavSnap);
window.addEventListener('load', setupNavSnap);

const posts = [
  {
    slug: 'ai-environmental-impact',
    path: 'content/blog/ai-environmental-impact.md',
    title: 'Does Using AI Hurt the Environment? What the Data Actually Says',
    date: 'February 15, 2026',
    description: 'Separating fact from misinformation about AI\'s energy use, water consumption, and what actually matters.',
  },
  {
    slug: 'seo-basics',
    path: 'content/blog/seo-basics.md',
    title: '3 SEO Basics Most Business Sites Miss',
    date: 'January 11, 2026',
    description: 'Simple technical fixes that increase discoverability without a full rewrite.',
  },
  {
    slug: 'performance-audit-checklist',
    path: 'content/blog/performance-audit-checklist.md',
    title: 'A Fast Performance Audit Checklist for Small Teams',
    date: 'January 4, 2026',
    description: 'A repeatable process to find and fix front-end bottlenecks quickly.',
  },
];

const postMap = Object.fromEntries(posts.map((p) => [p.slug, p]));

const escapeHtml = (text) =>
  text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const parseInlineMarkdown = (line) => {
  const escaped = escapeHtml(line);
  const withLinks = escaped.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  return withLinks.replace(/`([^`]+)`/g, '<code>$1</code>');
};

const markdownToHtml = (markdown) => {
  const lines = markdown.split('\n');
  const html = [];
  let inList = false;

  const closeList = () => {
    if (inList) {
      html.push('</ul>');
      inList = false;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      closeList();
      continue;
    }

    if (line.startsWith('# ')) {
      closeList();
      html.push(`<h1>${parseInlineMarkdown(line.slice(2))}</h1>`);
      continue;
    }

    if (line.startsWith('## ')) {
      closeList();
      html.push(`<h2>${parseInlineMarkdown(line.slice(3))}</h2>`);
      continue;
    }

    if (line.startsWith('- ')) {
      if (!inList) {
        html.push('<ul>');
        inList = true;
      }
      html.push(`<li>${parseInlineMarkdown(line.slice(2))}</li>`);
      continue;
    }

    closeList();
    html.push(`<p>${parseInlineMarkdown(line)}</p>`);
  }

  closeList();
  return html.join('\n');
};

const renderError = (container) => {
  container.innerHTML = '<h1>Article not found</h1><p>Return to the <a href="blog.html">blog index</a>.</p>';
};

const loadPost = async () => {
  const container = document.querySelector('[data-markdown-container]');
  if (!container) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const slug = params.get('post');
  const entry = slug ? postMap[slug] : null;

  if (!entry) {
    renderError(container);
    return;
  }

  try {
    const response = await fetch(entry.path, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error('Failed to fetch article');
    }

    const markdown = await response.text();
    container.innerHTML = markdownToHtml(markdown);

    const title = container.querySelector('h1')?.textContent || entry.title;
    document.title = `${title} | Matthew Wren`;
  } catch (error) {
    renderError(container);
  }
};

const renderBlogList = () => {
  const container = document.querySelector('[data-blog-list]');
  if (!container) return;

  container.innerHTML = posts
    .map(
      (post) =>
        `<article class="card blog-card">
          <p class="blog-meta">${escapeHtml(post.date)}</p>
          <h2><a href="blog-post.html?post=${encodeURIComponent(post.slug)}">${escapeHtml(post.title)}</a></h2>
          <p>${escapeHtml(post.description)}</p>
        </article>`
    )
    .join('\n');
};

void loadPost();
renderBlogList();

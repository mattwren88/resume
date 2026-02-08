const postMap = {
  'seo-basics': {
    path: 'content/blog/seo-basics.md',
    fallbackTitle: '3 SEO Basics Most Business Sites Miss',
  },
  'performance-audit-checklist': {
    path: 'content/blog/performance-audit-checklist.md',
    fallbackTitle: 'A Fast Performance Audit Checklist for Small Teams',
  },
};

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

    const title = container.querySelector('h1')?.textContent || entry.fallbackTitle;
    document.title = `${title} | Matthew Wren`;
  } catch (error) {
    renderError(container);
  }
};

void loadPost();

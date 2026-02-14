# CLAUDE.md — mattwren.dev

## Pending Tasks
- Add a detailed inline comment to every CSS property in `styles.css` and `themes.css` explaining what each property does

## Project Overview
Static portfolio/resume website for Matt Wren, a web developer specializing in local business websites. Deployed at **mattwren.dev** via GitHub Pages.

## Tech Stack
- **HTML/CSS/JS** — vanilla, no frameworks, no build tools, no dependencies
- **Google Fonts** — Space Grotesk (body), Source Serif 4 (headings)
- **GitHub Pages** — static hosting, custom domain via `CNAME`

## Key Files
| File | Purpose |
|------|---------|
| `index.html` | Home / landing page |
| `about.html` | About page |
| `resume.html` | Resume page |
| `blog.html` | Blog listing |
| `blog-post.html` | Blog post template |
| `contact.html` | Contact form |
| `styles.css` | Main stylesheet |
| `themes.css` | Theme variants (heritage, editorial, brutalist) |
| `scripts/site.js` | Theme switching, nav animations, misc JS |
| `scripts/blog.js` | Blog post rendering from Markdown |
| `content/blog/` | Blog post Markdown files |
| `images/` | Site images (logo, favicon, photos) |
| `docs/` | Reference docs, case studies, LinkedIn export, SEO.md, README.md |

## Design System
CSS custom properties defined in `styles.css` (spacing/type scale) and `themes.css` (colors/typography/radii per theme):
- **Colors:** `--ink`, `--muted`, `--accent`, `--accent-soft`, `--surface`, `--line`, `--bg-body`
- **Shadows:** `--shadow`, `--shadow-soft`
- **Spacing:** `--space-xs` through `--space-2xl`
- **Type scale:** `--text-xs` through `--text-hero`, `--text-eyebrow`
- **Fonts:** `--font-sans`, `--font-serif`
- **Radii:** `--radius-lg`, `--radius-md`, `--radius-pill`
- **Type weights:** `--type-weight-brand`, `--type-weight-h1`, `--type-weight-h2`
- **Three themes:** heritage (default), editorial, brutalist — switchable via UI, persisted in localStorage

## SEO
See [docs/SEO.md](docs/SEO.md) for the full checklist. Apply it to every page — every time.

## Deployment
- Hosted on GitHub Pages
- Custom domain: `mattwren.dev` (configured via `CNAME`)
- No build step — push to `main` deploys automatically

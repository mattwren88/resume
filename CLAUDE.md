# CLAUDE.md — mattwren.dev

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
| `docs/` | Reference docs, case studies, LinkedIn export |

## Design System
CSS custom properties defined in `styles.css` and `themes.css`:
- **Colors:** `--ink`, `--accent`, `--surface`, `--paper`
- **Spacing:** `--space-xs` through `--space-2xl`
- **Type scale:** `--text-xs` through `--text-hero`
- **Three themes:** heritage (default), editorial, brutalist — switchable via UI, persisted in localStorage

## Deployment
- Hosted on GitHub Pages
- Custom domain: `mattwren.dev` (configured via `CNAME`)
- No build step — push to `main` deploys automatically

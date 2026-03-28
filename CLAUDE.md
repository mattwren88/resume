# CLAUDE.md — mattwren.dev

## Pending Tasks
- Add a detailed inline comment to every CSS property in `css/` files explaining what each property does

## Project Overview
Static portfolio/resume website for Matt Wren, a web developer specializing in local business websites. Deployed at **mattwren.dev** via GitHub Pages.

## Tech Stack
- **HTML/CSS/JS** — vanilla, no frameworks, no build tools, no dependencies
- **Google Fonts** — Outfit (body/UI), Instrument Serif (headings, italic)
- **GitHub Pages** — static hosting, custom domain via `CNAME`

## Key Files
| File | Purpose |
|------|---------|
| `index.html` | Home / landing page |
| `about.html` | About page |
| `resume.html` | Redirect → about.html |
| `blog.html` | Blog listing |
| `blog-post.html` | Blog post template |
| `contact.html` | Contact form |
| `css/main.css` | CSS entry point (`@import`s all partials) |
| `css/base.css` | Root tokens (colors, fonts, spacing, radii), body styles, typography |
| `css/layout.css` | Page wrapper, grid layout, sidebar |
| `css/nav.css` | Top nav, brand, logo, nav links, pill indicators |
| `css/hero.css` | Hero section, photo, copy, meta card |
| `css/components.css` | Buttons, cards, grids, forms, timeline, blog, footer |
| `css/print.css` | Print-optimised overrides |
| `css/responsive.css` | Reduced motion, tablet, mobile breakpoints |
| `css/reset.css` | Box-sizing, margin/padding reset |
| `scripts/site.js` | Nav pill animations, page transitions, misc JS |
| `scripts/blog.js` | Blog post rendering from Markdown |
| `content/blog/` | Blog post Markdown files |
| `images/` | Site images (logo, favicon, photos) |
| `docs/` | Reference docs, case studies, LinkedIn export, SEO.md, README.md |

## Design System
All CSS custom properties defined in `css/base.css` `:root` — single theme, no switching:
- **Colors:** `--ink` (#1a1a1a), `--muted` (#5c5c5c), `--accent` (#0d7377 teal), `--accent-soft`, `--accent-hover`, `--surface` (#fff), `--line`, `--bg-body` (#f8f8f8)
- **Shadows:** `--shadow`, `--shadow-soft`
- **Spacing:** `--space-xs` through `--space-2xl`
- **Type scale:** `--text-xs` through `--text-hero`, `--text-eyebrow`
- **Fonts:** `--font-sans` (Outfit), `--font-serif` (Instrument Serif, italic)
- **Radii:** `--radius-lg` (12px), `--radius-md` (8px), `--radius-pill`
- **Type weights:** `--type-weight-brand`, `--type-weight-h1`, `--type-weight-h2`

## SEO
See [docs/SEO.md](docs/SEO.md) for the full checklist. Apply it to every page — every time.

## Deployment
- Hosted on GitHub Pages
- Custom domain: `mattwren.dev` (configured via `CNAME`)
- No build step — push to `main` deploys automatically

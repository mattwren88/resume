# CLAUDE.md — mattwren.dev

## Pending Tasks
- Add a detailed inline comment to every CSS property in `css/` files explaining what each property does
- Confirm `hello@mattwren.dev` is a live mailbox — it is the only contact route on the site
- Decide whether to scrub `images/reference/` from git history (untracked as of 2026-08-16, but old commits still contain it)

## Project Overview
Static portfolio site for Matt Wren, a web developer in Scranton PA specializing
in CMS work for higher education. Two pages. Deployed at **mattwren.dev** via
GitHub Pages.

The site leads with two side projects — **Keystone Atlas** (a layered map of
Pennsylvania) and **The Northeast Almanac** (a NEPA events calendar) — and treats
services as a short availability note rather than a pitch. It does not sell AI
automation; that positioning was retired in the 2026 redesign.

## Publishing rule — read first
GitHub Pages serves **the entire repo**. Anything tracked is downloadable from
mattwren.dev, whether or not a page links it. Never track client work, contracts,
personal exports, or reference screenshots. See `.gitignore`.

## Tech Stack
- **HTML/JS** — vanilla, hand-written, no framework
- **CSS** — sources in `css/`, bundled to `css/dist/main.min.css` by PostCSS
  (`npm run build:css`). Pages link the built file, which is committed — so a CSS
  change is not live until you rebuild.
- **Fonts** — Outfit + EB Garamond (Google); Instrument Serif, Newsreader and
  JetBrains Mono (Google, home page only, for the project tiles); Cormorant
  Garamond + Lora self-hosted in `fonts/`
- **GitHub Pages** — custom domain via `CNAME`

## Key Files
| File | Purpose |
|------|---------|
| `index.html` | Home — intro, project tiles, statement band, services |
| `about.html` | About — bio, career timeline, tools |
| `css/main.css` | Entry point; `@import`s the partials in order |
| `css/fonts.css` | `@font-face` for the two self-hosted faces |
| `css/colors.css` | Palette tokens + the dark theme |
| `css/typography.css` | Font stacks, type scale, weights, tracking |
| `css/spacing.css` | Space scale, radii, shadows, layout maxima |
| `css/motion.css` | Easing curves, durations, lift distances |
| `css/base.css` | Reset, element defaults, the grain overlay |
| `css/site.css` | All page-level layout and components |
| `css/print.css` | Print overrides (about.html is what people print) |
| `scripts/site.js` | Light/dark toggle only |
| `content/blog/` | Archived posts from the retired blog |
| `images/` | Favicon, logo, profile photo, project favicons |
| `fonts/` | Self-hosted woff2 |
| `docs/SEO.md` | SEO checklist |

## Design System
Tokens are defined across `css/colors.css`, `typography.css`, `spacing.css` and
`motion.css`. Source of truth is the separate "Matt Wren Design System" export,
which is gitignored and not published.

- **Colors:** `--ink` (#0f1419), `--muted` (#4a5568), `--accent` moss (#5a6b4a),
  `--accent-soft/glow/deep/deepest/pale`, `--surface` (#fff), `--line`,
  `--bg-body` warm off-white (#f5f5f0)
- **Themes:** light + a warm dark (`:root[data-theme='dark']`). Follows the OS on
  first visit, remembers a manual choice in `localStorage` under `mw-theme`. The
  initial theme is set by an inline `<head>` script to avoid a flash.
- **Type:** `--font-sans` Outfit for everything structural; `--font-serif` EB
  Garamond **italic** for h1/h2 and the wordmark — the italic is the identity, do
  not set those upright. h3 and below revert to Outfit.
- **Spacing:** 6/12/16/24/32/48/72. **Radii:** 6/10/16/999.
- **Motion:** one curve, `--ease-out`. Nothing bounces or spins except the mark.
- **Grain:** `class="has-grain"` on `<body>`. Multiplies on light, screens on dark.
- **Project tiles:** `.t-ka` and `.t-na` carry Keystone Atlas's and the Almanac's
  own type and palettes, and stay light in dark mode on purpose. Don't restyle
  them into the site's moss.

## SEO
See [docs/SEO.md](docs/SEO.md). Apply it to every page — every time. Both pages
carry canonical, robots, author, Open Graph, Twitter cards and JSON-LD.

## Deployment
- Push to `main` — GitHub Pages deploys from the repo root
- Rebuild CSS first if you touched `css/`, or the change won't ship

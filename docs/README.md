# mattwren.dev

Personal site for Matthew Wren — web developer, Scranton PA. Two pages, static
HTML, deployed to GitHub Pages at `mattwren.dev`.

## Structure

- `index.html` — home: intro, the two project tiles, statement band, services
- `about.html` — bio, career timeline, tools
- `css/` — sources; `css/main.css` imports the rest in order
- `css/dist/main.min.css` — the built stylesheet the pages actually link
- `scripts/site.js` — the light/dark toggle, and nothing else
- `fonts/` — self-hosted Cormorant Garamond 600 and Lora 400, used only by the
  Keystone Atlas project tile
- `images/` — favicon, logo, profile photo
- `content/blog/` — archived posts from the retired blog, kept as source material

## Build

CSS is bundled and minified with PostCSS. Edit the files in `css/`, then:

```
npm run build:css
```

That flattens the `@import` chain, drops unused rules with PurgeCSS, and writes
`css/dist/main.min.css`, which is committed. The HTML is hand-written — there is
no build step for it.

## Design

Design system lives in the separate "Matt Wren Design System" export (gitignored,
not published). The parts this site uses are copied into `css/` as token files:
`colors`, `typography`, `spacing`, `motion`, `fonts`, then `base` and `site`.

- Accent is moss `#5a6b4a` on warm off-white `#f5f5f0`
- Outfit for structure, EB Garamond *italic* for h1/h2 and the wordmark
- Light and dark themes, following the OS and remembered in `localStorage`
- The grain overlay (`class="has-grain"` on `<body>`) is the signature detail
- The two project tiles are deliberately set in their own brands' faces and
  palettes, and stay light in dark mode

## Publishing

Never track anything under `docs/linkedin/`, `docs/contracts/`,
`docs/case-studies/` or `images/reference/`. GitHub Pages serves the whole repo,
so a tracked file is a published file. See `.gitignore`.

## Deploy

Push to `main`. GitHub Pages builds from the repo root; the custom domain is set
by `CNAME`.

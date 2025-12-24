# resume

Simple static resume site.

## Structure
- `index.html` - main page markup
- `styles.css` - site styles
- `images/mattwren.jpg` - profile photo used on the site
- `images/reference/` - LinkedIn screenshots and crops (reference only)
- `docs/linkedin/` - LinkedIn data export and source HTML (reference only)

## Notes
- CSS uses nesting and modern selectors like `:where()` and `:has()`; use a modern browser.

## Deploy
- GitHub Pages: push to a repo, enable Pages from the repo settings, and select the `main` branch root.
- Netlify: drag-and-drop the folder or connect the repo and set the publish directory to the repo root.
- Vercel: import the repo and set the framework to “Other”; output directory is the repo root.

## Design Notes
- Fonts: Fraunces (headings), Space Grotesk (body).
- Color system: defined in `:root` in `styles.css` under `--ink`, `--accent`, `--surface`, and `--paper`.
- Layout: two-column grid with a sticky-ish visual sidebar; mobile stacks with sidebar below content.

## License
This project is intended for personal use. Replace the content and assets before sharing publicly.

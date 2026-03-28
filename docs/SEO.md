# SEO Checklist — mattwren.dev

Apply to every HTML page. Do not create or update a page without verifying this list is complete.

## Core meta
```html
<title>Page Title | Matthew Wren</title>
<meta name="description" content="Unique 150–160 char description." />
<link rel="canonical" href="https://www.matthew-wren.com/page.html" />
<meta name="robots" content="index, follow" />
<meta name="author" content="Matthew Wren" />
```

## Open Graph
```html
<meta property="og:type" content="website" />           <!-- or article for blog posts -->
<meta property="og:site_name" content="Matthew Wren" />
<meta property="og:locale" content="en_US" />
<meta property="og:title" content="Page Title | Matthew Wren" />
<meta property="og:description" content="Same as meta description." />
<meta property="og:url" content="https://www.matthew-wren.com/page.html" />
<meta property="og:image" content="https://www.matthew-wren.com/images/mattwren.jpg" />
```

## Twitter / X Cards
```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Page Title | Matthew Wren" />
<meta name="twitter:description" content="Same as meta description." />
<meta name="twitter:image" content="https://www.matthew-wren.com/images/mattwren.jpg" />
```

## JSON-LD (page-specific schema)
| Page | Schema type |
|------|-------------|
| `index.html` | `ProfilePage` + `Person` ✅ |
| `about.html` | `AboutPage` ✅ |
| `contact.html` | `ContactPage` ✅ |
| `blog.html` | `Blog` ✅ |
| `blog-post.html` | `BlogPosting` (injected dynamically by `blog.js`) ✅ |
| `resume.html` | `ProfilePage` |

## HTML best practices
- One `<h1>` per page — matches the page topic, not the site name
- Logical heading order — no skipped levels (h1 → h2 → h3)
- All `<img>` tags have descriptive `alt` attributes
- All links have meaningful text — no "click here" or "read more" without context

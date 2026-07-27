# Bucket 3 — Sample Pages (Per-Section Folders) & Layouts

`sample-pages/` is the site **decomposed**: one folder per page, and inside it one folder
per section, each holding that single section's self-contained html + css + js. Beside
`pages/` sits `layouts/` for the shared shells (header, footer, …). This is the bucket a
teammate uses to grab **exactly one section** and drop it into their own work — the
proof-of-concept "partners" slice is one of these folders.

## Layout

```
sample-pages/
├── layouts/
│   ├── header/   { header.html, header.css, header.js }
│   ├── footer/   { footer.html, footer.css, footer.js }
│   └── <layout>/ …                       # add more only when a page needs a new shell
└── pages/
    ├── home/
    │   ├── hero/      { index.html, hero.css, hero.js }
    │   ├── partners/  { index.html, partners.css, partners.js, img/… }
    │   ├── services/  { index.html, services.css, services.js }
    │   └── …                              # one folder per home section, in page order
    ├── about/
    │   └── <section>/ { index.html, <section>.css, <section>.js }
    └── …
```

## A section folder is self-contained & previewable

Each `<Section>/` folder opens **on its own** in a browser and looks/behaves like it does
on the site. Contents:

| File | Holds |
| ---- | ----- |
| `index.html` | the page shell: `<head>` (fonts + CDN libs + links to global + this section's css), the **comment-bannered `<section>`**, and — for scroll-driven sections — **filler/layout wrappers** so the animation has room. Loads `<section>.js` at the end. |
| `<section>.css` | the section's scoped rules (the same CSS that would sit in the site's inline `<style>`), prefixed `.es__`. |
| `<section>.js` | the section's behaviour (e.g. GSAP pin/reveal), guarded for `prefers-reduced-motion`. |
| `img/…` | only the few images this section needs, copied so the folder is portable. |

### `index.html` skeleton for a section folder

```html
<!DOCTYPE html><html lang="en"><head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Partners — section preview</title>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../../../site/assets/css/global.css">   <!-- or a local copy -->
  <link rel="stylesheet" href="partners.css">
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.12/dist/gsap.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.12/dist/ScrollTrigger.min.js"></script>
</head><body>
  <!-- filler BEFORE: gives a scroll-pinned section room to enter -->
  <section class="es__filler es__filler--hero"><h1>Scroll down ↓</h1></section>

  <!-- ===== SECTION: Partners — pins; cards ring→arc on scroll ===== -->
  <section class="es__partners" data-partners-section>…</section>

  <!-- filler AFTER: content the pin releases into -->
  <section class="es__filler es__filler--after"><h2>The page continues…</h2></section>

  <script src="partners.js"></script>
</body></html>
```

> **Why filler sections?** A pinned/scroll-triggered section needs scrollable space
> before and after it or it cannot demonstrate its behaviour standalone. Static sections
> (a plain hero, a card grid) don't need filler — just render the section.

### Global stylesheet: link vs copy

- **Link** to the canonical sheet (`../../../site/assets/css/global.css`) to stay in sync
  while inside the template, **or**
- **Copy** a `global.css` into the folder for a fully portable, single-folder handoff.

Pick one and note it in `AGENTS.md`. (The bundled example copies a trimmed `global.css`
so each folder is portable.)

## Layouts

`layouts/<Layout>/` holds a shared shell that wraps pages — at minimum `header/` and
`footer/`. Each is the same html + css + js trio and previews standalone. Add another
layout folder **only** when a real page needs a different shell (e.g. a bare
`blank/` layout for an auth/landing page). Don't pre-create unused layouts.

Layout CSS that the site relies on (`.es__header*`, `.es__footer*`) also lives in the
site's `global.css`; the layout folder's own css can re-state it for standalone preview.

## Building this bucket from the site

1. For each page in `site/`, create `sample-pages/pages/<page>/`.
2. For each section on that page, create `<section>/`:
   - move the section's `<style>` content into `<section>.css`,
   - put the `<section>…</section>` markup into `index.html` with the shell + filler,
   - move/port the section's JS into `<section>.js`,
   - copy any images it references into `img/`.
3. Extract header/footer into `layouts/`.
4. Verify each folder opens and behaves on its own.

## Checklist

- [ ] `pages/<Page>/<Section>/` for every site section, in page order.
- [ ] Each section folder = `index.html` + `<section>.css` + `<section>.js` (+ `img/` if needed).
- [ ] Scroll-driven sections include before/after filler so they animate alone.
- [ ] `layouts/` exists with `header/` and `footer/`; extra layouts only when needed.
- [ ] Each folder opens standalone (CDN libs + global linked or copied).
- [ ] Same `.es__` classes, comment banner, and reduced-motion guard as the site.

# Bucket 1 — Pages & Commented Sections

The `site/` bucket is the real, navigable site. A **page** is a flat `.html` file whose
`<body>` is a vertical stack of **sections**. Each section is a self-contained,
comment-bannered block with its own `<style>` above it. This is the bucket an LLM reads
to understand the site.

## Page anatomy

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>…</title>
    <!-- SEO/meta -->
    <!-- Fonts + CDN libs -->
    <link rel="stylesheet" href="assets/css/global.css" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.12/dist/gsap.min.js"></script>
  </head>
  <body>
    <!-- ===== LAYOUT: Header ===== -->
    <header class="es__header" …>…</header>

    <main>
      <!-- ===== SECTION: Hero — full-screen intro, 3D word reveal ===== -->
      <style> .es__hero{…} .es__hero__title{…} </style>
      <section class="es__hero" id="home">…</section>

      <!-- ===== SECTION: Services — tabbed services switcher ===== -->
      <style> .es__services{…} </style>
      <section class="es__services" id="services">…</section>

      <!-- …more sections… -->
    </main>

    <!-- ===== LAYOUT: Footer ===== -->
    <footer class="es__footer">…</footer>

    <script src="assets/js/main.js"></script>
  </body>
</html>
```

## The comment banner (required on every section)

A scannable banner so a human or LLM can locate and reason about a section instantly:

```html
<!-- ============================================================
     SECTION: <Name>
     <one line: what it shows>
     <one line: behaviour — e.g. "pins on scroll; cards ring→arc">
     ============================================================ -->
```

Keep the `SECTION:` token literal and the name unique within the page. Use
`LAYOUT:` for the header/footer shells.

## Section block = three co-located parts

A section ships as **markup + its CSS + (optional) its JS**, kept together so it can be
lifted as one unit:

1. **CSS** in a `<style>` immediately **above** the `<section>` (section-only rules; the
   shared rules already live in `global.css`).
2. **Markup**: a single semantic `<section class="es__<name>">` with `.es__`-prefixed
   children and an `id` if it is a nav/scroll target.
3. **JS**: shared behaviours (reveal, accordion, nav) go in `assets/js/main.js` keyed off
   `data-*` hooks; a heavy, section-specific animation may get its own
   `assets/js/<section>.js` loaded at the end of the page.

```html
<!-- ===== SECTION: FAQ — accordion; first item open ===== -->
<style>
  .es__faq{ padding:8rem 0; background:var(--es-white); }
  .es__faq__item{ border:1px solid var(--es-border); border-radius:1rem; overflow:hidden; }
  .es__faq__q{ width:100%; display:flex; justify-content:space-between; gap:1rem;
               padding:1.5rem; background:var(--es-white); cursor:pointer; }
  .es__faq__a{ max-height:0; overflow:hidden; transition:max-height .3s ease; }
  .es__faq__item.es--open .es__faq__a{ max-height:20rem; }
</style>
<section class="es__faq">
  <div class="es__container">
    <div class="es__faq__item es--open" data-accordion>
      <button class="es__faq__q" data-accordion-toggle>
        <span>What are your typical timelines?</span>
        <span class="es__faq__icon" aria-hidden="true">+</span>
      </button>
      <div class="es__faq__a"><p>…</p></div>
    </div>
  </div>
</section>
```

## Rules

- **One `<section>` per visual region**, top to bottom in the order a visitor sees them.
- **Mock data only.** Forms validate client-side and show a faked success toast/inline
  message; never POST to a private backend. Numbers/quotes are static content.
- **Accessibility:** `alt` on images, `<label>`/`aria-*` on inputs, real `<button>`/`<a>`
  for actions, visible focus, `aria-expanded` on toggles.
- **Shared shells** (header, footer, preloader) are authored once; their CSS is in
  `global.css` and their markup is repeated per page (or injected — see
  `details/interactivity.md`). They use `LAYOUT:` banners, not `SECTION:`.
- **IDs for navigation.** Give a section `id="services"` etc. when the nav or a CTA links
  to `#services`; smooth-scroll handles the jump.

## Multi-page consistency

- Header/footer markup is identical on every page (copy it, or inject from a partial via
  `main.js` — your choice; document which in `AGENTS.md`).
- The active nav link gets `.es--active`.
- Pages that open over a dark hero set a tone hook on the header
  (`data-tone="light"`) so the transparent header is legible until scroll.

## Checklist (per page)

- [ ] `<head>` has meta, fonts, CDN libs, and `global.css`.
- [ ] Header (`LAYOUT:` banner) then `<main>` then footer.
- [ ] Every `<section>` has a `SECTION:` comment banner and a unique name.
- [ ] Section-only CSS is in a `<style>` directly above the section.
- [ ] All classes are `.es__`-prefixed; tokens used instead of literals.
- [ ] Nav targets have `id`s; active link marked; forms mocked; a11y covered.

# Styling — The `.es__` Prefix, Global vs Section CSS, Tokens

The whole point of this template is that **a section can be pasted into any project
without its styles colliding** with the host design. Two rules make that true: a single
class prefix, and section-scoped styles.

## 1. One class prefix on everything

Every class — in markup and in CSS — starts with the project prefix. Default `es__`
(short for the project, e.g. *EigenSol*). Pick ONE prefix per template and never break it.

```html
<section class="es__hero">
  <h1 class="es__hero__title">…</h1>
  <a class="es__btn es__btn--primary">Start</a>
</section>
```

Naming follows BEM under the prefix:

```
.es__<block>                 /* .es__hero,  .es__card */
.es__<block>__<element>      /* .es__hero__title */
.es__<block>--<modifier>     /* .es__card--featured */
.es--<state>                 /* state hook toggled by JS: .es--in, .es--open, .es--scrolled */
```

Why a state class uses `es--` (two dashes, no block): it is a generic, JS-toggled flag
(`element.classList.add('es--in')`) that any block can read
(`.es__reveal.es--in { … }`).

**Allowed exceptions (do not reprefix):** third-party widget classes the library itself
emits — `swiper-*`, `lenis`, `lucide`, `gsap-marker-*`. Wrap them in an `.es__` container
so your overrides stay namespaced (`.es__partners .swiper-pagination-bullet { … }`).

## 2. Global stylesheet vs section `<style>`

There is exactly **one** global stylesheet: `site/assets/css/global.css`. It holds only
what is genuinely shared:

| Allowed in `global.css` | Examples |
| ----------------------- | -------- |
| Design tokens | `:root { --es-orange: #ff7744; … }` |
| Reset & base | `*{box-sizing}`, `body`, headings, `img`, `a` |
| Layout helpers | `.es__container`, `.es__section` |
| Buttons & shared atoms | `.es__btn`, `.es__btn--primary`, `.es__eyebrow` |
| The shared shells | `.es__header*`, `.es__footer*`, `.es__preloader*` |
| Global niceties | scrollbar, `::selection`, `:focus-visible`, reduced-motion |

**Everything else lives in a `<style>` block directly above its `<section>`** so the
section is a self-contained unit (see `details/sections.md`). Never start a second global
stylesheet, and never put one section's rules in `global.css`.

> Decomposed sample sections (`sample-pages/…`) keep their CSS in a sibling
> `<section>.css` file instead of an inline `<style>` — same content, just extracted so
> the folder reads as html + css + js. Both forms are equivalent.

## 3. Tokens are CSS variables

Define every color, font, radius, and key spacing once, in `global.css :root`. Section
rules reference the variables — never raw literals.

```css
:root {
  /* color */
  --es-white:#fff; --es-dark:#101114; --es-body:#585858; --es-heading:#121212;
  --es-blue:#3b82f6; --es-cyan:#56ccf2; --es-orange:#ff7744; --es-orange-dark:#e85d2c; --es-lime:#9be15d;
  --es-muted:#f3f4f6; --es-border:rgba(0,0,0,.1); --es-radius:.625rem;
  /* type */
  --es-font-head:"Space Grotesk",sans-serif;
  --es-font-body:"Manrope",sans-serif;
  --es-font-mono:"JetBrains Mono",monospace;
  /* layout */
  --es-maxw:1280px;
}
```

```css
/* GOOD — reads a token */            /* BAD — raw literal in a section rule */
.es__card{                             .es__card{
  background:var(--es-white);            background:#ffffff;
  border-radius:var(--es-radius);        border-radius:10px;
  font-family:var(--es-font-body);       font-family:Manrope, sans-serif;
}                                       }
```

Inline `style="…"` is acceptable **only** for one-off *dynamic* values (a computed
position, a CSS custom property set from JS like `--es-mouse-x`). Never use inline style
for tokenizable design values (color, spacing, radius, font).

## 4. Libraries via CDN (no build step)

Load fonts and libraries from a pinned CDN in `<head>`. Details + the full registry in
`details/interactivity.md`. The rule here: no bundler, no `node_modules`, versions pinned.

```html
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/global.css">
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12/dist/ScrollTrigger.min.js"></script>
```

## 5. Responsiveness & motion

- **Mobile-first.** Base rules target the smallest viewport; scale up with
  `@media (min-width: …)`. Prefer `rem`, `%`, `clamp()` over fixed px widths.
- **Fluid type** with `clamp()`: `font-size: clamp(2.25rem, 5vw, 3.75rem);`.
- **Transitions** on `transform` / `opacity`. Interactive elements need visible
  `:hover` and `:focus-visible` states.
- **Respect reduced motion** globally:

```css
@media (prefers-reduced-motion: reduce){
  *,*::before,*::after{
    animation-duration:.01ms!important; animation-iteration-count:1!important;
    transition-duration:.01ms!important; scroll-behavior:auto!important;
  }
}
```

And in JS, branch on `window.matchMedia('(prefers-reduced-motion: reduce)').matches` to
skip heavy timelines (jump straight to the resolved state).

## Anti-patterns

| Anti-pattern | Fix |
| ------------ | --- |
| `class="flex items-center px-4 md:text-lg"` (Tailwind left in) | One `.es__…` class backed by CSS. |
| `.hero`, `.card` (unprefixed) | `.es__hero`, `.es__card`. |
| `#ff7744` / `16px` in a section rule | `var(--es-orange)` / a spacing token. |
| Two global stylesheets | One `global.css`; section rules co-located. |
| `!important` to beat another rule | Fix the other rule / specificity. |
| Inline `style="color:#…"` repeated | Move to a class + token. |
| Re-prefixing a library's own classes | Leave `swiper-*`; wrap in an `.es__` container. |

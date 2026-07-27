# Interactivity — JS Patterns & the CDN Library Registry

No build step: every library is a **pinned** `<script>`/`<link>` in `<head>`, and behaviour
is plain ES (IIFE or small modules) keyed off `data-*` hooks. Shared behaviour lives in
`site/assets/js/main.js`; a heavy section animation gets its own `assets/js/<section>.js`
(and, when decomposed, the same file lives in the section folder).

## CDN registry (pin the major version)

| Need | Tag |
| ---- | --- |
| Fonts | `<link href="https://fonts.googleapis.com/css2?family=…&display=swap" rel="stylesheet">` |
| Scroll/timeline animation | `https://cdn.jsdelivr.net/npm/gsap@3.12/dist/gsap.min.js` |
| Scroll triggers / pinning | `https://cdn.jsdelivr.net/npm/gsap@3.12/dist/ScrollTrigger.min.js` |
| Smooth scroll | `https://cdn.jsdelivr.net/npm/lenis@1.1/dist/lenis.min.js` (+ its css) |
| Carousels / sliders | `https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js` (+ `swiper-bundle.min.css`) |
| Icons | `https://unpkg.com/lucide@latest/dist/umd/lucide.min.js` then `lucide.createIcons()` |
| Confetti / fun | `https://cdn.jsdelivr.net/npm/canvas-confetti@1.9/dist/confetti.browser.min.js` |

Load order: libraries in `<head>` (sync) so they exist before page code; page code at the
end of `<body>` or `defer`. Always feature-check: `if (!window.gsap) return;`.

## Core patterns

### Sticky/scrolled header

```js
const header = document.querySelector('.es__header');
const onScroll = () => header.classList.toggle('es--scrolled', window.scrollY > 50);
onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
```

### Mobile nav toggle

```js
const btn = document.querySelector('[data-nav-toggle]');
const menu = document.querySelector('[data-nav-menu]');
btn?.addEventListener('click', () => {
  const open = menu.classList.toggle('es--open');
  btn.setAttribute('aria-expanded', String(open));
});
```

### Accordion (FAQ)

```js
document.querySelectorAll('[data-accordion-toggle]').forEach((b) => {
  b.addEventListener('click', () => {
    const item = b.closest('[data-accordion]');
    item.classList.toggle('es--open');
    b.setAttribute('aria-expanded', item.classList.contains('es--open'));
  });
});
```

### Scroll reveal (generic, IntersectionObserver)

```js
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting){ e.target.classList.add('es--in'); io.unobserve(e.target);} });
}, { rootMargin: '-100px' });
document.querySelectorAll('.es__reveal').forEach((el) => io.observe(el));
```
```css
.es__reveal{opacity:0;transform:translateY(24px);transition:opacity .7s ease,transform .7s ease}
.es__reveal.es--in{opacity:1;transform:none}
```

### Count-up number

```js
function countUp(el){ const end=+el.dataset.count, dur=2000, t0=performance.now();
  (function tick(now){ const p=Math.min((now-t0)/dur,1); el.textContent=Math.round(end*(1-(1-p)**3))+(el.dataset.suffix||'');
    if(p<1) requestAnimationFrame(tick); })(performance.now()); }
```

### GSAP pinned section (the partners pattern)

```js
if (!window.gsap || !window.ScrollTrigger) return;
gsap.registerPlugin(ScrollTrigger);
if (matchMedia('(prefers-reduced-motion: reduce)').matches){ /* set end-state, return */ }
gsap.timeline({ scrollTrigger:{ trigger:section, start:'top top', end:'+=2600',
  scrub:1, pin:true, anticipatePin:1, invalidateOnRefresh:true }})
  .to(cards, { /* …function-based x/y/rotate/scale… */ });
new ResizeObserver(() => requestAnimationFrame(() => ScrollTrigger.refresh())).observe(stage);
```

### Marquee (CSS-only, no JS)

```css
.es__marquee__track{ display:inline-flex; white-space:nowrap; animation:es-marquee 9s linear infinite; }
@keyframes es-marquee{ from{transform:translateX(0)} to{transform:translateX(-50%)} }
```
Duplicate the content once inside the track so the loop is seamless.

## Principles

- **Progressive enhancement.** The section must read fine with JS disabled; JS adds motion.
- **Guard everything.** Feature-check libraries; null-check elements; bail on reduced motion.
- **`data-*` hooks, not classes, for JS selection.** Classes are for styling; `data-*`
  for behaviour (`[data-accordion]`, `[data-partners-section]`).
- **One section's JS is self-contained** so it travels with the section folder in
  `sample-pages/`.
- **Pin needs scroll room** — see the filler-section rule in `details/sample-pages.md`.
- **Forms are mocked**: `e.preventDefault()`, validate, show a faked success message; no
  real network.

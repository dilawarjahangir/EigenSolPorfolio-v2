# Bucket 2 — The Component Catalog

`components/` documents the design's reusable pieces — from **atoms** (button, spinner,
badge, input) up to **big cards** — with pages that render **every variant, size, and
state**. HTML has no import system, so this catalog is a *visual contract and reference*:
the canonical markup + classes for each piece, which the site and sample-pages reuse by
copying the same `.es__` markup.

## Layout

```
components/
├── index.html                 # catalog index: links every family page, shows a swatch row
├── assets/css/components.css   # optional catalog-only chrome (grids, labels) — reuse global.css for the pieces
└── pages/
    ├── foundations.html        # colors, typography, spacing, radii, shadows
    ├── buttons.html
    ├── spinners.html
    ├── badges.html
    ├── inputs.html             # text, email, textarea, select, checkbox, radio, switch
    ├── cards.html              # content card, stat card, project card, pricing card…
    ├── accordions.html
    ├── tabs.html
    ├── navbars.html            # header tones, mobile menu
    └── …                       # one page per family
```

Every family page links back to `index.html`; `index.html` links to every family.

## The component taxonomy (atoms → cards)

| Tier | Examples | Notes |
| ---- | -------- | ----- |
| **Foundations** | color tokens, type scale, spacing, radii, shadows, icons | render as swatches/specimens, not interactive |
| **Atoms** | button, icon-button, spinner, badge/pill, tag, avatar, divider, link, input, checkbox, radio, switch, label | smallest pieces; one class block each |
| **Molecules** | input-group, form-field (label+input+help+error), dropdown, tooltip, pagination, breadcrumb, stat | atoms composed |
| **Cards / composites** | content card, project card, stat card, pricing card, testimonial card, FAQ item, feature tile | the "big card components" the brief calls out |
| **Navigation** | header (tones), mobile menu, footer columns, tabs | shells reused by layouts |

## What every catalog page must show

For each component family, render a labelled grid covering:

1. **Every variant** side by side (`primary / outline-dark / outline-light / ghost`).
2. **Every size** in a consistent strip (`sm / md / lg`).
3. **Every state**, reachable and visible:
   `default · hover · focus-visible · active · disabled · loading · empty · error · selected`.
   Show states you cannot fake with `:hover` as a forced class (`.es--loading`, `.es--disabled`).
4. **A realistic "with content" example** using mock data (not lorem where a real label helps).
5. **An edge case**: long text, narrow container, missing optional data.
6. **The class reference**: a small `<code>` block listing the classes/modifiers for that piece.

### Catalog page anatomy

```html
<!-- ===== CATALOG: Buttons ===== -->
<style>
  .es__cat__grid{ display:grid; gap:1.5rem; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); }
  .es__cat__cell{ border:1px solid var(--es-border); border-radius:1rem; padding:1.5rem; }
  .es__cat__label{ font-family:var(--es-font-mono); font-size:.75rem; text-transform:uppercase;
                   letter-spacing:.12em; color:var(--es-body); margin-bottom:1rem; }
</style>
<section class="es__container">
  <h1>Buttons</h1>

  <h2>Variants</h2>
  <div class="es__cat__grid">
    <div class="es__cat__cell"><div class="es__cat__label">primary</div>
      <button class="es__btn es__btn--primary">Start a Project</button></div>
    <div class="es__cat__cell"><div class="es__cat__label">outline-dark</div>
      <button class="es__btn es__btn--outline-dark">View Work</button></div>
    <!-- …ghost, link… -->
  </div>

  <h2>Sizes</h2>
  <div class="es__cat__grid">
    <div class="es__cat__cell"><div class="es__cat__label">sm</div>
      <button class="es__btn es__btn--primary es__btn--sm">Small</button></div>
    <!-- md, lg -->
  </div>

  <h2>States</h2>
  <div class="es__cat__grid">
    <div class="es__cat__cell"><div class="es__cat__label">disabled</div>
      <button class="es__btn es__btn--primary" disabled>Disabled</button></div>
    <div class="es__cat__cell"><div class="es__cat__label">loading</div>
      <button class="es__btn es__btn--primary es--loading"><span class="es__spinner"></span> Sending…</button></div>
  </div>

  <h2>Classes</h2>
  <pre><code>.es__btn  --primary --outline-dark --outline-light --ghost  --sm --md --lg  + .es--loading / [disabled]</code></pre>
</section>
```

## Rules

- **Reuse, don't fork.** A component's canonical CSS lives in `global.css` (atoms like
  `.es__btn`) or, for bigger composites, in the catalog page's `<style>` that the site
  section copies verbatim. Keep one definition; the catalog and site must not drift.
- **No new prefix.** Catalog pieces use the same `.es__` classes the site uses.
- **States via class hooks.** Anything JS would toggle (`loading`, `open`, `selected`)
  is shown by adding the `es--<state>` class statically in the catalog cell.
- **Mock data only**; no network. A "loading" card is a forced state, not a real fetch.
- **Index swatches.** `index.html` opens with the color tokens and type scale so the
  brand reads at a glance.

## Checklist

- [ ] One page per component family; index links them all.
- [ ] Each page renders variants × sizes × states in labelled grids.
- [ ] A "with content" example and an edge case per family.
- [ ] Class/modifier reference block on each page.
- [ ] Same `.es__` classes as the site; no duplicate/competing definitions.
- [ ] States shown via `es--*` hooks; everything mocked.

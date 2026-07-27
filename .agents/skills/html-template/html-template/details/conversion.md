# Converting a React/SPA → This Template, and the Four Docs

Most templates start from an existing React/Vue/SPA marketing site. This is an
**extraction**: keep the design and content, drop the framework, emit static HTML in the
three buckets.

## Conversion workflow

1. **Onboard & inventory.** Read the project docs and routing. Produce:
   - **Routes → pages**: each route becomes a `site/<name>.html` (dynamic routes like
     `/case-studies/:id` become per-slug files or one template).
   - **Page → sections**: the ordered components a page renders (Hero, Services, …).
   - **Assets**: copy the source `public/` (and logo) into `site/assets/img/` — reuse the
     real images; don't regenerate them.
   - **Libraries / fonts / colors**: note what to map to CDN tags and tokens.
2. **Extract tokens.** Pull the CSS variables / theme into `global.css :root` as `--es-*`.
   Pick the class prefix.
3. **Translate each section.** For every component:
   - Convert JSX → semantic HTML; **replace utility/Tailwind classes with one `.es__`
     class** backed by real CSS (utilities can't be namespaced, so they must go).
   - Put the section's rules in a `<style>` above the `<section>`; shared rules → `global.css`.
   - Add the `SECTION:` comment banner.
   - Port behaviour to vanilla JS + CDN libs (`details/interactivity.md`); simplify a
     framework-only animation to the closest faithful CSS/GSAP equivalent.
   - Replace API calls with mock success/empty states.
4. **Assemble pages** in section order; add the shared header/footer; wire `main.js`.
5. **Promote components.** Anything reused (buttons, cards) → a `components/` catalog page.
6. **Decompose** into `sample-pages/` (per-section folders) + `layouts/`.
7. **Document** (below) and **verify** with the check scripts.

### Fidelity guidance

- Match layout, content, colors, type, spacing, and the *visible result* of key
  animations. It is fine to render a scroll-pinned, JS-heavy React interaction as a
  click/scroll-driven CSS+GSAP equivalent as long as it looks and feels the same.
- Preserve copy verbatim (headings, paragraphs, labels) and real image paths.
- Keep accessibility: alt text, labels, focus, semantic elements.

## The four Markdown docs (and ONLY these)

Place all four at the **template root**. No other `.md` files.

### `METADATA.md` — for LLMs (machine-readable map)

A precise index an LLM can load to understand the template without reading every file:
- The three buckets and where each lives.
- **Pages**: each page file → its ordered list of sections (with the section's class +
  the sample-pages folder path).
- **Design tokens**: the `--es-*` variables and their values.
- **Libraries**: each CDN tag and what uses it.
- **Conventions**: the prefix, section-`<style>` rule, comment-banner format.
- **Asset map**: where images live.

### `AGENTS.md` — for LLMs (rules & how to edit safely)

Operating instructions for an agent working in the template:
- The non-negotiable conventions (prefix, one global sheet, section-scoped `<style>`,
  CDN, mock data, four docs only).
- How to **add a page**, **add a section**, **add a component**, **add a layout** (the
  exact files to create and update).
- The global-stylesheet policy for sample folders (link vs copy).
- How to run the check scripts before declaring done.
- What NOT to do (introduce a build step, leak utility classes, add stray docs).

### `README.md` — for humans (short)

- One-paragraph what-it-is.
- How to preview (open `site/index.html`; needs internet for CDN fonts/libs; or serve
  with any static server).
- The top-level folder map (the three buckets + docs), a few lines each.
- Credits / license if relevant.

### `PAGES_AND_SECTIONS.md` — for humans (inventory)

A readable table/outline:
- Each page → its sections in order, one line describing each.
- The matching `sample-pages/` path per section.
- The `layouts/` list.

Keep README and PAGES_AND_SECTIONS short and skimmable; put exhaustive machine detail in
METADATA.md.

## Conversion checklist

- [ ] Every route has a page; every page lists its sections in order.
- [ ] Source images copied into `assets/img/`; real paths preserved.
- [ ] Tokens extracted to `:root`; prefix chosen and applied everywhere.
- [ ] No utility/Tailwind classes survive in markup; section CSS scoped; shared CSS global.
- [ ] Behaviour ported to CDN libs with reduced-motion guards; forms mocked.
- [ ] Components promoted to the catalog; sections decomposed into sample-pages + layouts.
- [ ] The four docs written at the root; no other `.md` added.

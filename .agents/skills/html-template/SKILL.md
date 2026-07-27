---
name: html-template
description: Build a premium, copy-paste-friendly static HTML template (or convert an existing React/SPA site into one) organized as three buckets — a working multi-page HTML site, a component catalog, and decomposed per-section sample pages with layouts. Enforces an `.es__` class prefix, section-scoped <style> blocks above each section, one global stylesheet, CDN-loaded libraries, and LLM-readable commented sections.
version: 1.0.0
author: EigenSol
tags: [html, css, javascript, template, sections, components, gsap, static-site, conversion]
triggers:
  - "convert this React/Vue/SPA site into static HTML"
  - "make an HTML template"
  - "build a copy-paste HTML section"
  - "create a component catalog in HTML"
  - "split each section into its own folder"
  - "add a layouts folder (header/footer)"
  - "package one section so it works standalone"
  - "review this HTML template for the es__ convention"
---

# SKILL: HTML Template Development

> Build **one** static HTML template that a human or an LLM can read, preview, and
> paste into any project **without style collisions**. The same template is shipped
> in **three buckets**: a working site, a component catalog, and decomposed sample
> pages. Every class is namespaced with `.es__`, section styles sit in a `<style>`
> directly above each section, shared rules live in one global stylesheet, and
> libraries come from a CDN.
>
> **Self-contained.** Everything needed lives in this file and in `details/`. Pairs
> well with `frontend-dev` / `fe-template-dev` (React craft) and `md-docs`
> (documentation), but does not depend on them.

---

## When to Use This Skill

Activate when the user asks to:

- **Convert** an existing React / Vue / SPA marketing site into a static HTML template.
- **Author** a new HTML template, page, or section from a design.
- **Package one section** so it previews standalone (like a single hero or partners block).
- **Build a component catalog** — atoms (buttons, spinners, badges) up through big cards — with pages that render every variant and state.
- **Decompose** a site into per-page / per-section folders plus a `layouts/` folder.
- **Review / fix** an HTML template for the `.es__` prefix, section-scoping, or folder layout.

Do NOT use this skill when:

- The deliverable is a React/Vue/Svelte component or app → use `frontend-dev`.
- The deliverable is a reusable React design system / npm package → use `fe-template-dev`.
- The work is purely Markdown documentation → use `md-docs`.

---

## The Three Buckets (the whole mental model)

A template root holds **three** delivery shapes of the *same* design. Build them in
this order; each reuses the tokens and section markup of the one before it.

| # | Bucket | Folder | What it is | Detail |
| - | ------ | ------ | ---------- | ------ |
| 1 | **Site** | `site/` | The real, navigable multi-page site. Each page is composed of clearly commented sections, each with a section-scoped `<style>`. | `details/sections.md` |
| 2 | **Components** | `components/` | A catalog: atoms → molecules → cards, with pages that render **every** variant, size, and state. | `details/components.md` |
| 3 | **Sample pages** | `sample-pages/` | The site decomposed into `pages/<Page>/<Section>/` folders (each section standalone & previewable) plus a `layouts/<Layout>/` folder (header, footer, …). | `details/sample-pages.md` |

All three share: the `.es__` naming convention, one `global.css`, CDN libraries, and
the four Markdown docs. See `details/architecture.md` for the full tree.

---

## Non-Negotiable Conventions

1. **`.es__` prefix on every class.** No bare/utility class names leak into markup or
   CSS (`.es__hero`, `.es__btn--primary`, state hook `.es--in`). This is what makes a
   section safe to paste into a foreign design. Replace a real prefix per project, but
   keep ONE prefix. (`details/styling.md`)
2. **Section styles live in a `<style>` directly above the `<section>`.** A section
   carries its own CSS so it can be lifted as one unit. Only truly shared rules
   (tokens, reset, layout helpers, buttons, header, footer) go in `global.css`. No
   second global stylesheet. (`details/sections.md`, `details/styling.md`)
3. **Every section is wrapped in a comment banner.** A scannable
   `<!-- ===== SECTION: Name — what it does / behaviour ===== -->` so any LLM can find
   and reason about a section instantly. (`details/sections.md`)
4. **Libraries come from a CDN, pinned, in `<head>`.** No build step, no bundler, no
   `node_modules`. GSAP, Swiper, Lenis, Lucide, etc. are `<script>`/`<link>` tags.
   (`details/interactivity.md`)
5. **Design tokens are CSS variables.** No hex / px / font-stack literals in component
   rules — reference `var(--es-…)`. Tokens are defined once in `global.css :root`.
   (`details/styling.md`)
6. **Mock data only; no real backend.** Forms validate and show a faked success state;
   there is no fetch to a private API. (`details/sections.md`)
7. **Self-contained previews.** A section that depends on scroll (pin/reveal) ships
   with filler/layout wrappers so it animates correctly when opened on its own.
   (`details/sample-pages.md`)
8. **Document for two audiences.** `METADATA.md` + `AGENTS.md` for LLMs;
   `README.md` + `PAGES_AND_SECTIONS.md` for humans. Only those four `.md` files.
   (`details/conversion.md`)

---

## Phase 1 — Detect

Run the focused check script(s) on the template root or a subfolder. Each is
independent — run only what applies. Findings format: `path:line: [SEVERITY] [RULE] message`.

| Script | Use when |
| ------ | -------- |
| `check-structure.py` | Auditing the bucket layout, layouts folder, and required docs. |
| `check-styling.py`   | Enforcing the `.es__` prefix, catching leaked Tailwind/utility classes, raw hex, missing tokens. |
| `check-sections.py`  | Verifying comment banners, section-scoped `<style>` placement, and section-folder self-containment. |
| `check.py`           | All of the above in one pass. |

```bash
python3 .agents/skills/html-template/scripts/check.py local/html-template/
python3 .agents/skills/html-template/scripts/check-styling.py local/html-template/site/
python3 .agents/skills/html-template/scripts/check-sections.py local/html-template/sample-pages/
```

To **bootstrap** a fresh template skeleton (all three buckets + global.css + an example
section + the four docs):

```bash
python3 .agents/skills/html-template/scripts/init.py local/html-template
```

---

## Phase 2 — Plan (lock before writing)

1. **Inventory** the source. If converting from React/SPA: list routes → pages, and
   the ordered sections of each page; note libraries, fonts, colors, images.
   (`details/conversion.md`)
2. **Tokens first.** Extract colors, fonts, radii, spacing into `global.css :root` as
   `--es-*` variables. Pick the class prefix (default `es__`). (`details/styling.md`)
3. **Global vs section split.** Decide what is shared (reset, container, buttons,
   header, footer, preloader) vs section-local. Shared → `global.css`; everything else
   → section `<style>`. (`details/styling.md`)
4. **CDN list.** Map each used library to a pinned CDN tag. (`details/interactivity.md`)
5. **Bucket order.** Build the **site** first (it defines the sections), then the
   **components** catalog (promote repeated atoms/cards), then **sample-pages**
   (decompose the site sections + layouts). (`details/architecture.md`)
6. **Docs.** Plan `METADATA.md`, `AGENTS.md`, `README.md`, `PAGES_AND_SECTIONS.md`.
   (`details/conversion.md`)

---

## Phase 3 — Build (apply in order)

1. **Foundations.** `global.css` (tokens + reset + helpers + buttons), `<head>` with
   fonts + CDN libs, and the global header/footer markup.
2. **Site pages.** For each page: a comment-bannered section, a section-scoped
   `<style>` above it, semantic `.es__`-prefixed markup, then the next section. Wire
   shared JS (`assets/js/main.js`) for nav, reveal, accordions, etc.
3. **Interactivity.** Port animations to CDN GSAP/Swiper/Lenis. Respect
   `prefers-reduced-motion`. Keep each section's JS in its own file when decomposed.
4. **Components catalog.** Extract atoms → cards. One catalog page per family, each
   rendering all variants × sizes × states with a labelled grid. (`details/components.md`)
5. **Sample pages.** Decompose each site section into `pages/<Page>/<Section>/`
   (its own `index.html` + `.css` + `.js`, with filler/layout wrappers for scroll), and
   add `layouts/<Layout>/`. (`details/sample-pages.md`)
6. **Docs.** Write the four Markdown files.

---

## Phase 4 — Verify

1. Re-run the relevant `scripts/check-*.py` — no WARN findings remain.
2. Every class in markup and CSS starts with the chosen prefix (`es__` / `es--`),
   except allow-listed third-party hooks (`swiper-*`, `lenis`, `lucide`).
3. Every `<section>` has a comment banner; section-only CSS sits in a `<style>` above
   it; `global.css` holds only shared rules.
4. Every CDN `<script>`/`<link>` is version-pinned and loads before the code that uses it.
5. Open each page in a browser: nav works, animations run, forms show a faked success,
   and a `prefers-reduced-motion` pass degrades gracefully.
6. Each sample section folder opens **standalone** and animates correctly.
7. The four docs exist and match the built structure. No other `.md` files were added.
8. Report changes as `file:line - rule - fix`, plus a "moves" list (`from → to`) when
   files were relocated.

---

## Quick Reference — Template Root Layout

```
html-template/                      # the template root (e.g. local/html-template/)
├── site/                           # BUCKET 1 — the working multi-page site
│   ├── index.html  about.html  services.html  …  404.html
│   └── assets/{ css/global.css, js/main.js, img/… }
├── components/                     # BUCKET 2 — the component catalog
│   ├── index.html                  # catalog index (links every family page)
│   └── pages/{ buttons.html, spinners.html, badges.html, cards.html, forms.html, … }
├── sample-pages/                   # BUCKET 3 — decomposed sections + layouts
│   ├── layouts/{ header/, footer/, … }      # each: <name>.html + .css + .js
│   └── pages/<Page>/<Section>/              # each section standalone (index.html + .css + .js)
├── METADATA.md   AGENTS.md         # for LLMs
└── README.md     PAGES_AND_SECTIONS.md      # for humans
```

### Decision Tables

| Question | Answer |
| -------- | ------ |
| A color / font / radius value | A `--es-*` token in `global.css :root`; reference `var(--es-…)`. |
| A rule used by 2+ sections (reset, container, button, header, footer) | `global.css`. |
| A rule used by exactly one section | A `<style>` block directly above that `<section>`. |
| A class name | Prefix it `es__` (`es--` for a state hook). Never a bare utility name. |
| A reused UI piece (button, badge, card) | A catalog entry in `components/`; render all variants. |
| One section, isolated and previewable | A `sample-pages/pages/<Page>/<Section>/` folder. |
| Header / footer / nav shell | A `sample-pages/layouts/<Layout>/` folder + shared rules in `global.css`. |
| A third-party widget needs styling | Allow its own prefix (`swiper-*`); wrap it in an `.es__` container. |
| Animation / smooth-scroll / carousel | A pinned CDN library in `<head>` (`details/interactivity.md`). |

---

## Common Mistakes to Avoid

| Anti-pattern | Correct approach |
| ------------ | ---------------- |
| Leaving Tailwind utility classes in the markup (`flex px-4 md:text-lg`) | Convert to a single `.es__…` class backed by CSS. |
| Unprefixed class names (`.hero`, `.card`) | Prefix every class (`.es__hero`, `.es__card`). |
| One giant stylesheet with every page's rules | Section rules in a `<style>` above the section; only shared rules global. |
| A second/third global stylesheet | Exactly one `global.css`; everything else co-located. |
| Hardcoded `#hex` / `16px` / font stacks in section CSS | Reference `var(--es-…)` tokens. |
| `<section>` with no comment banner | Precede every section with `<!-- ===== SECTION: … ===== -->`. |
| A scroll-pinned section folder that won't animate alone | Ship filler/layout wrappers so it has scroll room. |
| Bundling libraries / committing `node_modules` | Pinned CDN `<script>`/`<link>` in `<head>`. |
| A catalog page showing one button | Render every variant × size × state in a labelled grid. |
| Real `fetch` to a private backend | Mock it; show a faked success/empty/loading state. |
| Adding stray `.md` files | Only `METADATA.md`, `AGENTS.md`, `README.md`, `PAGES_AND_SECTIONS.md`. |

---

## Quality Checklist

- [ ] Relevant `scripts/check-*.py` return no WARN findings.
- [ ] All three buckets exist (`site/`, `components/`, `sample-pages/`) and follow the layout.
- [ ] Every class is prefixed (`es__` / `es--`); no leaked Tailwind/utility classes.
- [ ] Section CSS sits in a `<style>` above each `<section>`; `global.css` is the only global sheet.
- [ ] Tokens are CSS variables; no raw hex/px/font literals in section rules.
- [ ] Every `<section>` has a comment banner naming it and its behaviour.
- [ ] Libraries are pinned CDN tags in `<head>`, loaded before dependent code.
- [ ] `prefers-reduced-motion` is respected; focus states are visible.
- [ ] Catalog renders every variant × size × state; sample sections preview standalone.
- [ ] `layouts/` exists alongside sample `pages/`; extra layouts added only when needed.
- [ ] The four docs exist and match the structure; no other `.md` files were added.

---

## Detail Index

| Topic | File |
| ----- | ---- |
| Buckets, full folder tree, naming | `details/architecture.md` |
| `.es__` prefix, global vs section CSS, tokens, CDN, responsive, motion | `details/styling.md` |
| Bucket 1 — pages, commented sections, scoped `<style>` anatomy | `details/sections.md` |
| Bucket 2 — component catalog (atoms → cards), variants & states | `details/components.md` |
| Bucket 3 — per-section folders + layouts, standalone previews | `details/sample-pages.md` |
| JS patterns + the pinned CDN library registry | `details/interactivity.md` |
| Converting a React/SPA into this template + the four Markdown docs | `details/conversion.md` |

---

## Changelog

| Version | Date | Change |
| ------- | ---- | ------ |
| 1.0.0 | 2026-06-13 | Initial release. Three-bucket model (site / components / sample-pages), `.es__` prefix + section-scoped `<style>` conventions, CDN interactivity, React→HTML conversion workflow, four-doc rule, and three check scripts plus an `init.py` scaffolder. |

# Architecture — The Three Buckets & Folder Tree

The template root holds **three buckets** that are three delivery shapes of the same
design, plus four Markdown docs. Build order: **site → components → sample-pages**.

```
html-template/                          # template root (example: local/html-template/)
│
├── site/                               # ── BUCKET 1: the working multi-page site ──
│   ├── index.html                      # home (composed of commented sections)
│   ├── about.html
│   ├── services.html
│   ├── case-studies.html
│   ├── contact.html
│   ├── careers.html
│   ├── 404.html
│   ├── case-studies/<slug>.html        # detail pages (optional sub-routes)
│   └── assets/
│       ├── css/global.css              # the ONE global stylesheet (tokens + shared)
│       ├── js/main.js                  # shared behaviour (nav, reveal, accordions…)
│       └── img/…                        # all images, copied from the source `public/`
│
├── components/                         # ── BUCKET 2: the component catalog ──
│   ├── index.html                      # catalog index — links every family page
│   ├── assets/css/components.css        # catalog-only chrome (optional; reuse global.css)
│   └── pages/
│       ├── buttons.html  spinners.html  badges.html  inputs.html
│       ├── cards.html    accordions.html  tabs.html   navbars.html
│       └── …                            # one page per component family
│
├── sample-pages/                       # ── BUCKET 3: decomposed sections + layouts ──
│   ├── layouts/
│   │   ├── header/  { header.html, header.css, header.js }
│   │   ├── footer/  { footer.html, footer.css, footer.js }
│   │   └── <more layouts only when a page needs them>
│   └── pages/
│       ├── home/
│       │   ├── hero/      { index.html, hero.css, hero.js }
│       │   ├── partners/  { index.html, partners.css, partners.js }
│       │   └── …
│       ├── about/
│       │   └── <section>/ { index.html, <section>.css, <section>.js }
│       └── …
│
├── METADATA.md           # LLM: machine-readable map of pages, sections, tokens, libs
├── AGENTS.md             # LLM: rules + how to edit/extend safely
├── README.md             # human: what it is, how to open/preview
└── PAGES_AND_SECTIONS.md # human: page → section inventory
```

## How the buckets relate

- **Site is the source of truth.** Sections are authored here first, fully styled and
  wired. The other two buckets are *derived* from it.
- **Components** is the reusable-atoms view. When the same button / badge / card recurs
  across sections, it is documented here as a family with all variants — but the site
  still uses plain `.es__` markup (no import system; HTML has no modules).
- **Sample-pages** is the granular view: each site section is lifted into its own folder
  so a teammate can grab exactly one section. `layouts/` holds the shared shells
  (header, footer) that wrap pages.

## Naming rules

| Thing | Rule | Example |
| ----- | ---- | ------- |
| Bucket dirs | lowercase, fixed names | `site/`, `components/`, `sample-pages/` |
| Site pages | lowercase, hyphenated `.html` | `case-studies.html` |
| Catalog pages | lowercase family name `.html` | `buttons.html`, `cards.html` |
| Sample page folders | lowercase page name | `home/`, `about/` |
| Sample section folders | lowercase section name | `hero/`, `partners/` |
| Layout folders | lowercase layout name | `header/`, `footer/` |
| Section asset files | `<section>.css`, `<section>.js`; entry `index.html` | `partners.css` |
| CSS classes | `es__<block>__<element>--<modifier>`; state hook `es--<state>` | `.es__card__title--lg`, `.es--in` |
| Tokens (CSS vars) | `--es-<group>-<name>` | `--es-orange`, `--es-font-head` |

## Where a new thing goes (cheat sheet)

| New thing | Location |
| --------- | -------- |
| A new page | `site/<name>.html` + a row in `PAGES_AND_SECTIONS.md` |
| A new section on a page | a comment-bannered block in the page + (decomposed) a `sample-pages/pages/<Page>/<Section>/` folder |
| A reused button/badge/card variant | a cell on the matching `components/pages/*.html` page |
| A new layout shell | `sample-pages/layouts/<Layout>/` + shared rules in `global.css` |
| A shared rule (reset, container, button) | `global.css` |
| A one-section rule | a `<style>` above that section |
| An image | `site/assets/img/…` (and copied into a sample section folder if it must preview standalone) |

## Path & portability notes

- Use **relative** asset paths so a folder works when opened with `file://` or served.
  Site pages reference `assets/img/…`; a sample section that must preview alone copies
  the few images it needs next to itself (e.g. `home/partners/img/…`).
- The template has **no build step**. Everything resolves as plain files + CDN tags.
- Keep the four docs at the **template root**, not inside a bucket.

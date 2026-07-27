#!/usr/bin/env python3
"""
init — scaffold a fresh html-template skeleton.

Creates the three buckets (site / components / sample-pages), a starter
global.css, one worked example section (a hero) in all three forms, a buttons
catalog page, header/footer layouts, and the four Markdown docs — all following
the .es__ conventions so the checks pass out of the box.

Usage:
    python3 init.py <target-dir>        # e.g. python3 init.py local/html-template
    python3 init.py <target-dir> --force  # write even if target exists & is non-empty
"""

from __future__ import annotations

import os
import sys

PREFIX = "es"  # class prefix => es__ / es--

# --------------------------------------------------------------------------- #
# File contents (kept small but valid; everything follows the conventions).
# --------------------------------------------------------------------------- #

GLOBAL_CSS = """/* ========================================================================
   GLOBAL STYLES — shared tokens, reset, helpers, buttons, shells.
   The ONLY global stylesheet. Section-specific rules live in a <style>
   above each section (or a sibling <section>.css in sample-pages).
   Every class is prefixed `.es__`; JS state hooks use `.es--`.
   ======================================================================== */
:root{
  --es-white:#ffffff; --es-dark:#101114; --es-body:#585858; --es-heading:#121212;
  --es-blue:#3b82f6; --es-cyan:#56ccf2; --es-orange:#ff7744; --es-orange-dark:#e85d2c; --es-lime:#9be15d;
  --es-muted:#f3f4f6; --es-border:rgba(0,0,0,.1); --es-radius:.625rem;
  --es-font-head:"Space Grotesk",-apple-system,BlinkMacSystemFont,sans-serif;
  --es-font-body:"Manrope",-apple-system,BlinkMacSystemFont,sans-serif;
  --es-font-mono:"JetBrains Mono",ui-monospace,monospace;
  --es-maxw:1280px;
}
*,*::before,*::after{box-sizing:border-box}
body{margin:0;font-family:var(--es-font-body);color:var(--es-body);background:var(--es-white);line-height:1.6;-webkit-font-smoothing:antialiased}
h1,h2,h3,h4,h5,h6{margin:0;font-family:var(--es-font-head);color:var(--es-heading);line-height:1.15}
p{margin:0} img,svg{display:block;max-width:100%} a{color:inherit;text-decoration:none}

.es__container{width:100%;max-width:var(--es-maxw);margin:0 auto;padding:0 1.5rem}
@media(min-width:1024px){.es__container{padding:0 2rem}}
.es__section{padding:6rem 0}
.es__eyebrow{display:inline-block;padding:.5rem 1rem;margin-bottom:1.5rem;border-radius:9999px;
  background:var(--es-muted);font-family:var(--es-font-mono);font-size:.875rem;letter-spacing:.04em;
  text-transform:uppercase;color:var(--es-body)}

/* Buttons */
.es__btn{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;border:0;border-radius:9999px;
  padding:.875rem 2rem;font-family:var(--es-font-body);font-weight:600;cursor:pointer;
  transition:background-color .25s ease,color .25s ease,transform .25s ease}
.es__btn--sm{padding:.5rem 1.25rem;font-size:.875rem}
.es__btn--lg{padding:1rem 2.25rem;font-size:1.0625rem}
.es__btn--primary{background:var(--es-orange);color:#fff}
.es__btn--primary:hover{background:var(--es-orange-dark);transform:translateY(-2px)}
.es__btn--outline-dark{background:transparent;border:2px solid var(--es-heading);color:var(--es-heading)}
.es__btn--outline-dark:hover{background:var(--es-heading);color:#fff}
.es__btn[disabled],.es__btn.es--loading{opacity:.6;cursor:not-allowed}

/* Spinner atom */
.es__spinner{width:1.1em;height:1.1em;border:2px solid rgba(255,255,255,.4);border-top-color:#fff;
  border-radius:50%;display:inline-block;animation:es-spin .7s linear infinite}
@keyframes es-spin{to{transform:rotate(360deg)}}

/* Header / footer shells */
.es__header{position:fixed;inset:0 0 auto 0;z-index:40;transition:background-color .3s,box-shadow .3s}
.es__header.es--scrolled{background:rgba(255,255,255,.95);backdrop-filter:blur(12px);box-shadow:0 1px 2px rgba(0,0,0,.06)}
.es__header__inner{display:flex;align-items:center;justify-content:space-between;height:5rem;
  max-width:var(--es-maxw);margin:0 auto;padding:0 1.5rem}
.es__nav{display:flex;gap:2rem}
.es__nav__link{font-weight:600;color:var(--es-body)}
.es__nav__link:hover,.es__nav__link.es--active{color:var(--es-orange)}
.es__footer{background:#000;color:#fff;padding:4rem 0 2rem}

/* Scroll-reveal utility */
.es__reveal{opacity:0;transform:translateY(24px);transition:opacity .7s ease,transform .7s ease}
.es__reveal.es--in{opacity:1;transform:none}

/* Demo filler sections (used by standalone section previews) */
.es__filler{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;min-height:100vh;padding:6rem 1.5rem}
.es__filler--hero{background:linear-gradient(180deg,#101114,#171a20);color:#fff}
.es__filler--hero h1{color:#fff;font-size:clamp(2rem,6vw,4rem);letter-spacing:-.02em}
.es__filler--after{background:var(--es-white)}

::selection{background:var(--es-orange);color:#fff}
:focus-visible{outline:2px solid var(--es-orange);outline-offset:2px}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important;scroll-behavior:auto!important}}
"""

FONTS_LINK = ('<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700'
              '&family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">')

SITE_INDEX = """<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Template — Home</title>
    __FONTS__
    <link rel="stylesheet" href="assets/css/global.css" />
  </head>
  <body>
    <!-- ===== LAYOUT: Header ===== -->
    <header class="es__header" data-header>
      <div class="es__header__inner">
        <a class="es__header__logo" href="index.html">Brand</a>
        <nav class="es__nav">
          <a class="es__nav__link es--active" href="index.html">Home</a>
          <a class="es__nav__link" href="#features">Features</a>
        </nav>
        <a class="es__btn es__btn--primary es__btn--sm" href="#contact">Start</a>
      </div>
    </header>

    <main>
      <!-- ============================================================
           SECTION: Hero
           Full-screen intro with headline, copy and CTAs.
           Static (no scroll dependency).
           ============================================================ -->
      <style>
        .es__hero{min-height:100vh;display:flex;align-items:center;justify-content:center;text-align:center;background:var(--es-white)}
        .es__hero__title{font-size:clamp(2.5rem,7vw,5rem);letter-spacing:-.02em;margin-bottom:1rem}
        .es__hero__lead{max-width:42rem;margin:0 auto 2rem;font-size:1.125rem}
        .es__hero__cta{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap}
      </style>
      <section class="es__hero" id="home">
        <div class="es__container">
          <span class="es__eyebrow">Starter Template</span>
          <h1 class="es__hero__title es__reveal">Build something people remember</h1>
          <p class="es__hero__lead es__reveal">A copy-paste-friendly HTML template with the <code>.es__</code> convention, section-scoped styles, and CDN libraries.</p>
          <div class="es__hero__cta es__reveal">
            <a class="es__btn es__btn--primary es__btn--lg" href="#contact">Get Started</a>
            <a class="es__btn es__btn--outline-dark es__btn--lg" href="#features">Learn More</a>
          </div>
        </div>
      </section>

      <!-- ============================================================
           SECTION: Features — three-up grid of value props.
           ============================================================ -->
      <style>
        .es__features{padding:6rem 0;background:var(--es-muted)}
        .es__features__grid{display:grid;gap:1.5rem;grid-template-columns:repeat(auto-fit,minmax(220px,1fr))}
        .es__features__card{background:var(--es-white);border:1px solid var(--es-border);border-radius:1rem;padding:2rem}
      </style>
      <section class="es__features" id="features">
        <div class="es__container">
          <span class="es__eyebrow">Features</span>
          <h2 class="es__reveal">Why this template</h2>
          <div class="es__features__grid">
            <div class="es__features__card es__reveal"><h3>Namespaced</h3><p>Every class is prefixed, so paste-in never collides.</p></div>
            <div class="es__features__card es__reveal"><h3>Section-scoped</h3><p>Each section carries its own styles for easy lifting.</p></div>
            <div class="es__features__card es__reveal"><h3>No build step</h3><p>Libraries load from a CDN; just open the file.</p></div>
          </div>
        </div>
      </section>
    </main>

    <!-- ===== LAYOUT: Footer ===== -->
    <footer class="es__footer" id="contact">
      <div class="es__container"><p>© 2026 Brand. Built from the html-template skill.</p></div>
    </footer>

    <script src="assets/js/main.js"></script>
  </body>
</html>
"""

MAIN_JS = """/* Shared site behaviour. Keyed off data-* hooks; styling stays in CSS. */
(function () {
  "use strict";

  // Sticky header tone
  var header = document.querySelector("[data-header]");
  if (header) {
    var onScroll = function () { header.classList.toggle("es--scrolled", window.scrollY > 50); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // Mobile nav toggle
  var navToggle = document.querySelector("[data-nav-toggle]");
  var navMenu = document.querySelector("[data-nav-menu]");
  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      var open = navMenu.classList.toggle("es--open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
  }

  // Accordion
  document.querySelectorAll("[data-accordion-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var item = btn.closest("[data-accordion]");
      if (!item) return;
      var open = item.classList.toggle("es--open");
      btn.setAttribute("aria-expanded", String(open));
    });
  });

  // Scroll reveal
  var revealEls = document.querySelectorAll(".es__reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("es--in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "-80px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("es--in"); });
  }
})();
"""

COMPONENTS_INDEX = """<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Component Catalog</title>
    __FONTS__
    <link rel="stylesheet" href="../site/assets/css/global.css" />
  </head>
  <body>
    <!-- ===== CATALOG: Index ===== -->
    <style>
      .es__cat__wrap{padding:4rem 0}
      .es__cat__swatches{display:flex;gap:.75rem;flex-wrap:wrap;margin:1.5rem 0}
      .es__cat__swatch{width:4rem;height:4rem;border-radius:.75rem;border:1px solid var(--es-border)}
      .es__cat__links a{display:inline-block;margin:0 1rem .5rem 0;font-family:var(--es-font-mono)}
    </style>
    <section class="es__cat__wrap">
      <div class="es__container">
        <span class="es__eyebrow">Catalog</span>
        <h1>Components</h1>
        <p>Every reusable piece, rendered in all its variants and states.</p>
        <div class="es__cat__swatches">
          <div class="es__cat__swatch" style="background:var(--es-orange)"></div>
          <div class="es__cat__swatch" style="background:var(--es-cyan)"></div>
          <div class="es__cat__swatch" style="background:var(--es-lime)"></div>
          <div class="es__cat__swatch" style="background:var(--es-dark)"></div>
        </div>
        <nav class="es__cat__links"><a href="pages/buttons.html">Buttons →</a></nav>
      </div>
    </section>
  </body>
</html>
"""

BUTTONS_PAGE = """<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Catalog — Buttons</title>
    __FONTS__
    <link rel="stylesheet" href="../../site/assets/css/global.css" />
  </head>
  <body>
    <!-- ===== CATALOG: Buttons ===== -->
    <style>
      .es__cat{padding:3rem 0}
      .es__cat__grid{display:grid;gap:1.5rem;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));margin-bottom:2.5rem}
      .es__cat__cell{border:1px solid var(--es-border);border-radius:1rem;padding:1.5rem;display:flex;flex-direction:column;gap:1rem;align-items:flex-start}
      .es__cat__label{font-family:var(--es-font-mono);font-size:.75rem;text-transform:uppercase;letter-spacing:.12em;color:var(--es-body)}
    </style>
    <section class="es__cat">
      <div class="es__container">
        <h1>Buttons</h1>

        <h2>Variants</h2>
        <div class="es__cat__grid">
          <div class="es__cat__cell"><span class="es__cat__label">primary</span><button class="es__btn es__btn--primary">Start a Project</button></div>
          <div class="es__cat__cell"><span class="es__cat__label">outline-dark</span><button class="es__btn es__btn--outline-dark">View Work</button></div>
        </div>

        <h2>Sizes</h2>
        <div class="es__cat__grid">
          <div class="es__cat__cell"><span class="es__cat__label">sm</span><button class="es__btn es__btn--primary es__btn--sm">Small</button></div>
          <div class="es__cat__cell"><span class="es__cat__label">md</span><button class="es__btn es__btn--primary">Medium</button></div>
          <div class="es__cat__cell"><span class="es__cat__label">lg</span><button class="es__btn es__btn--primary es__btn--lg">Large</button></div>
        </div>

        <h2>States</h2>
        <div class="es__cat__grid">
          <div class="es__cat__cell"><span class="es__cat__label">disabled</span><button class="es__btn es__btn--primary" disabled>Disabled</button></div>
          <div class="es__cat__cell"><span class="es__cat__label">loading</span><button class="es__btn es__btn--primary es--loading"><span class="es__spinner"></span> Sending…</button></div>
        </div>

        <h2>Classes</h2>
        <pre><code>.es__btn  --primary --outline-dark  --sm --md --lg  + .es--loading / [disabled]</code></pre>
      </div>
    </section>
  </body>
</html>
"""

HERO_SAMPLE_HTML = """<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Hero — section preview</title>
    __FONTS__
    <link rel="stylesheet" href="../../../../site/assets/css/global.css" />
    <link rel="stylesheet" href="hero.css" />
  </head>
  <body>
    <!-- ============================================================
         SECTION: Hero (standalone preview)
         Static section — no filler needed. Drop into any page.
         ============================================================ -->
    <section class="es__hero" id="home">
      <div class="es__container">
        <span class="es__eyebrow">Starter Template</span>
        <h1 class="es__hero__title">Build something people remember</h1>
        <p class="es__hero__lead">A copy-paste-friendly hero section.</p>
        <div class="es__hero__cta">
          <a class="es__btn es__btn--primary es__btn--lg" href="#">Get Started</a>
          <a class="es__btn es__btn--outline-dark es__btn--lg" href="#">Learn More</a>
        </div>
      </div>
    </section>
    <script src="hero.js"></script>
  </body>
</html>
"""

HERO_SAMPLE_CSS = """/* SECTION: Hero — scoped styles (same as the site's inline <style>). */
.es__hero{min-height:100vh;display:flex;align-items:center;justify-content:center;text-align:center;background:var(--es-white)}
.es__hero__title{font-size:clamp(2.5rem,7vw,5rem);letter-spacing:-.02em;margin-bottom:1rem}
.es__hero__lead{max-width:42rem;margin:0 auto 2rem;font-size:1.125rem}
.es__hero__cta{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap}
"""

HERO_SAMPLE_JS = """/* SECTION: Hero — no behaviour needed; placeholder for section-local JS. */
(function () { "use strict"; /* add hero interactions here */ })();
"""

HEADER_HTML = """<!-- ===== LAYOUT: Header (standalone preview) ===== -->
<header class="es__header es--scrolled" data-header>
  <div class="es__header__inner">
    <a class="es__header__logo" href="#">Brand</a>
    <nav class="es__nav">
      <a class="es__nav__link es--active" href="#">Home</a>
      <a class="es__nav__link" href="#">Features</a>
    </nav>
    <a class="es__btn es__btn--primary es__btn--sm" href="#">Start</a>
  </div>
</header>
"""

HEADER_CSS = """/* LAYOUT: Header — see global.css for the canonical shell rules. */
/* Add header-only overrides here when previewing standalone. */
"""

HEADER_JS = """/* LAYOUT: Header — sticky tone toggle. */
(function () {
  var header = document.querySelector("[data-header]");
  if (!header) return;
  var onScroll = function () { header.classList.toggle("es--scrolled", window.scrollY > 50); };
  onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
})();
"""

FOOTER_HTML = """<!-- ===== LAYOUT: Footer (standalone preview) ===== -->
<footer class="es__footer">
  <div class="es__container"><p>© 2026 Brand. All rights reserved.</p></div>
</footer>
"""

FOOTER_CSS = "/* LAYOUT: Footer — canonical rules live in global.css. */\n"
FOOTER_JS = "/* LAYOUT: Footer — no behaviour by default. */\n"

METADATA_MD = """# METADATA — machine-readable template map (for LLMs)

> Load this first. It indexes the template so you can edit it without reading every file.

## Buckets
- `site/` — the working multi-page site (source of truth for sections).
- `components/` — the component catalog (atoms → cards), all variants/states.
- `sample-pages/` — sections decomposed into `pages/<Page>/<Section>/` + `layouts/`.

## Pages → sections
| Page | Sections (in order) | Sample folder |
| ---- | ------------------- | ------------- |
| site/index.html | Hero, Features | sample-pages/pages/home/hero/ |

## Design tokens (global.css :root)
| Token | Value |
| ----- | ----- |
| --es-orange | #ff7744 |
| --es-cyan | #56ccf2 |
| --es-heading | #121212 |
| --es-font-head | Space Grotesk |
| --es-font-body | Manrope |

## Libraries (CDN)
| Library | Used by |
| ------- | ------- |
| (none yet) | add GSAP/Swiper/Lenis when a section needs them |

## Conventions
- Class prefix: `es__` (state hook `es--`).
- Section CSS in a `<style>` directly above each `<section>`; only shared rules in `global.css`.
- Comment banner above every section: `<!-- ===== SECTION: Name — … ===== -->`.
- Libraries via pinned CDN tags in `<head>`. No build step. Mock data only.
"""

AGENTS_MD = """# AGENTS — how to edit this template safely (for LLMs)

## Hard rules
1. Prefix EVERY class with `es__` (state hooks `es--`). No utility/Tailwind classes.
2. One global stylesheet: `site/assets/css/global.css`. Section rules go in a `<style>`
   directly above the section (or a sibling `<section>.css` in sample-pages).
3. Tokens are CSS variables (`--es-*`). No raw hex/px/font literals in section rules.
4. Libraries are pinned CDN `<script>`/`<link>` in `<head>`. No bundler, no node_modules.
5. Mock data only — no real network calls.
6. Only four `.md` docs exist (METADATA, AGENTS, README, PAGES_AND_SECTIONS). Add no others.

## Add a page
Create `site/<name>.html` (copy the header/footer), compose comment-bannered sections,
and add a row to `PAGES_AND_SECTIONS.md` + `METADATA.md`.

## Add a section
In the page: a `<!-- SECTION: … -->` banner, a `<style>` above it, semantic `.es__` markup.
Then decompose it into `sample-pages/pages/<Page>/<Section>/` (index.html + .css + .js;
add before/after filler if it is scroll-driven).

## Add a component
Add a cell to the matching `components/pages/*.html`, rendering all variants/sizes/states.
Reuse the same `.es__` classes — never fork a second definition.

## Add a layout
Create `sample-pages/layouts/<Layout>/` (html + css + js); add shared rules to global.css.

## Before declaring done
Run: `python3 .agents/skills/html-template/scripts/check.py <template-root>` — no WARN.
"""

README_MD = """# HTML Template

A copy-paste-friendly **static HTML template**. No build step — open a file in a browser
(internet is needed for the CDN fonts/libraries) or serve the folder with any static server.

## Folders
- `site/` — the working multi-page site (start at `site/index.html`).
- `components/` — a catalog of every reusable component and its variants.
- `sample-pages/` — each section in its own folder, plus shared `layouts/` (header, footer).

## Conventions
Every class is prefixed `es__`, each section carries its own `<style>`, shared rules live in
`site/assets/css/global.css`, and libraries load from a CDN. See `AGENTS.md` /
`METADATA.md` for the full contract, and `PAGES_AND_SECTIONS.md` for the page inventory.
"""

PAGES_AND_SECTIONS_MD = """# Pages & Sections (human inventory)

## site/index.html — Home
1. **Hero** — full-screen intro with headline and CTAs. → `sample-pages/pages/home/hero/`
2. **Features** — three value-prop cards.

## components/
- `index.html` — catalog index + color swatches.
- `pages/buttons.html` — button variants, sizes, states.

## Layouts
- `sample-pages/layouts/header/` — sticky site header.
- `sample-pages/layouts/footer/` — site footer.
"""


def _files() -> dict:
    return {
        "site/assets/css/global.css": GLOBAL_CSS,
        "site/assets/js/main.js": MAIN_JS,
        "site/index.html": SITE_INDEX.replace("__FONTS__", FONTS_LINK),
        "components/index.html": COMPONENTS_INDEX.replace("__FONTS__", FONTS_LINK),
        "components/pages/buttons.html": BUTTONS_PAGE.replace("__FONTS__", FONTS_LINK),
        "sample-pages/pages/home/hero/index.html": HERO_SAMPLE_HTML.replace("__FONTS__", FONTS_LINK),
        "sample-pages/pages/home/hero/hero.css": HERO_SAMPLE_CSS,
        "sample-pages/pages/home/hero/hero.js": HERO_SAMPLE_JS,
        "sample-pages/layouts/header/header.html": HEADER_HTML,
        "sample-pages/layouts/header/header.css": HEADER_CSS,
        "sample-pages/layouts/header/header.js": HEADER_JS,
        "sample-pages/layouts/footer/footer.html": FOOTER_HTML,
        "sample-pages/layouts/footer/footer.css": FOOTER_CSS,
        "sample-pages/layouts/footer/footer.js": FOOTER_JS,
        "METADATA.md": METADATA_MD,
        "AGENTS.md": AGENTS_MD,
        "README.md": README_MD,
        "PAGES_AND_SECTIONS.md": PAGES_AND_SECTIONS_MD,
    }


def main(argv: list) -> int:
    args = [a for a in argv[1:] if not a.startswith("-")]
    force = "--force" in argv[1:]
    if not args:
        sys.stderr.write("usage: init.py <target-dir> [--force]\n")
        return 2

    target = args[0]
    if os.path.isdir(target) and os.listdir(target) and not force:
        sys.stderr.write(f"refusing: '{target}' exists and is non-empty (use --force)\n")
        return 2

    files = _files()
    for rel, content in files.items():
        dest = os.path.join(target, rel)
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        with open(dest, "w", encoding="utf-8") as f:
            f.write(content)

    print(f"Scaffolded {len(files)} files into '{target}'.")
    print("Buckets: site/  components/  sample-pages/  + 4 docs.")
    print("Next: open site/index.html, then run scripts/check.py on the target.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))

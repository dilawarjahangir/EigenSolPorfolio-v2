You are a senior front-end developer with strong visual design judgment, specializing in dark, futuristic tech/SaaS marketing sites. Build exactly what is specified below. Do not ask clarifying questions — every decision has already been made. Do not substitute your own layout, palette, or copy ideas; follow this spec.

1. What you're building

One fully responsive, animated hero section for a software company called EigenSol. Output a single self-contained index.html file with CSS in a <style> tag and JS in a <script> tag (no build step, no frameworks, no external CSS/JS files except the two font/3D-viewer resources named below).

Visual concept, in words (the source is a screenshot, described here in full so no image is needed): Four layers, back to front, filling the entire viewport:

A near-black background with a soft dark-gray radial glow behind the center.
A giant, one-word wordmark — the brand name in capital letters, stretched almost edge-to-edge — rendered as a thin glowing outline only (no solid fill), like neon signage.
A 3D robot model (embedded via Spline, see §5), centered, tall enough to run from just above the wordmark down past the bottom of the viewport. Its head pokes up above the wordmark; its torso and arms sit in front of and partially cover the middle of the wordmark, so the wordmark reads as "behind" the robot. Faint drifting dust/particle specks are already part of this 3D scene — don't add a second particle layer.
On top, always fully readable regardless of what the 3D scene is doing: a small logo top-left, a hamburger icon top-right, a two-line headline anchored bottom-left, and a short paragraph + one button anchored bottom-right.
2. Exact copy — use verbatim, do not rewrite
Element	Text
Logo (top-left)	EigenSol
Giant wordmark	EIGENSOL (render the logo text in caps via CSS text-transform: uppercase, don't retype it in caps — keeps the brand name correctly cased in the HTML source)
Headline (bottom-left)	Shaping the / Future of Software — two lines, break after "the"
Paragraph (bottom-right)	EigenSol builds software that helps businesses run smarter — from the systems behind the scenes to the tools your team uses every day. Clean engineering, thoughtful design, and code built to scale with you.
Button	See Our Work (paired with a simple globe icon)
Nav menu links	Home, About, Work, Contact

Note for the human reading this later: the paragraph above is placeholder copy for a generic software company, since the brief didn't specify EigenSol's actual product or niche. It's written to avoid empty buzzwords, but swapping in what EigenSol actually builds will make it stronger — specific always beats generic.

3. Typography
Display font (logo, giant wordmark, headline): Neuropol X Heavy Expanded, by Typodermic Fonts. This is a paid/commercial typeface, not on Google Fonts — 30 styles total (5 weights × 3 widths × italics). To use the real font:
A desktop-use license is available free or low-cost directly from typodermicfonts.com or dafont.com/neuropol-x.font.
To legally embed it on a live website via @font-face, you need a webfont license specifically (desktop and webfont rights are usually sold separately) — available from Typodermic directly, or resellers like Fontspring / MyFonts / FontBros (roughly $70 for a single style, or a bundle for the full family).
Until those files are licensed and hosted, use Orbitron (free, open-source, on Google Fonts) as the stand-in — it has the same wide, geometric, sci-fi character. The reference implementation below already does this, with a commented-out @font-face block ready to uncomment once you have the real files.
Body font (paragraph, button, nav links): Inter, a clean neutral grotesque. A heavy expanded display face like Neuropol X is not meant for small body text — pairing it with a plain workhorse face for reading copy is standard type-pairing practice, not a shortcut.
Use fluid sizing (clamp()) throughout — no fixed pixel font sizes — so type scales smoothly between mobile and large desktop instead of jumping at breakpoints.
4. Color tokens
Token	Value	Used for
--bg	
#08080b	Page background
--bg-soft	
#131318	Radial glow behind the model
--text-primary	
#ffffff	Logo, wordmark, headline
--text-secondary	
#a4a4b0	Paragraph copy
--hairline	rgba(255,255,255,0.5)	Button border
--focus	
#7fd6ff	Keyboard focus ring only — not used decoratively

This is intentionally close to monochrome, matching the reference. Don't introduce a bright accent color (no neon green, no orange/terracotta gradient) — that's a generic "AI-generated site" tell, not this brand.

5. The 3D model (Spline)

Use this exact embed, once (it was pasted twice in the original brief — that's a duplication mistake to fix, not a requirement to include it twice, which would load the WebGL scene redundantly and hurt performance):

html
<script type="module" src="https://unpkg.com/@splinetool/viewer@1.12.98/build/spline-viewer.js"></script>
<spline-viewer url="https://prod.spline.design/z9oGue1tXFC9pUEF/scene.splinecode"></spline-viewer>
The loader <script> goes once in <head>. The <spline-viewer> element goes once, inside the hero, in its own full-bleed container sized via CSS (width: 100%; height: 100%) — the custom element does not size itself without explicit CSS dimensions.
The scene needs a transparent background for the wordmark to show through around/behind the robot (this appears to already be baked into the scene at that URL, matching the reference screenshot). If the model instead renders with an opaque black box, that's a setting inside the Spline scene itself (set before export), not something fixable from this HTML.
The small "Built with Spline" badge that appears automatically in the corner is standard on Spline's free tier — it's expected, not a bug, and shouldn't be hidden without a paid Spline plan that permits it.
6. Layout — build mobile-first, then enhance for desktop

Build the base version simple: header, then wordmark, then the 3D model, then the headline, then the paragraph + button, stacked top-to-bottom in that order, in normal document flow. This is also what phones and tablets see.

Then, at min-width: 860px, layer in the desktop version from the screenshot: header and content blocks switch to position: absolute, anchored to their corners —

┌───────────────────────────────────────────────┐
│ EigenSol                                   ☰   │  ← header, absolute, top:0
│                                                 │
│              E I G E N S O L                   │  ← wordmark, absolute, centered ~38% down
│         (giant outline text, glowing)          │
│                  [ 3D ROBOT ]                   │  ← spline-viewer, absolute, inset:0
│                                                 │
│ Shaping the                    Paragraph text  │  ← both absolute, anchored
│ Future of Software              [See Our Work] │     bottom-left / bottom-right
└───────────────────────────────────────────────┘

Building it this direction (simple flow first, absolute positioning as an enhancement) is deliberate: it means mobile never needs a pile of overrides to undo a desktop-only layout, which is where this kind of section usually breaks.

7. Animation — restrained, not scattered

Only these, nothing extra:

Header fades down on load; the two content blocks fade/rise up on load, staggered slightly after the header.
The giant wordmark fades in with a soft blur-to-sharp effect, then holds a slow, subtle glow pulse (~4.5s loop) indefinitely.
The CTA button gets a hover/focus state: fills white, text goes dark, faint glow, lifts 2px, icon nudges right.
The hamburger icon morphs into an X when the menu opens; the menu is a full-screen overlay with its links fading in with a slight stagger.
Optional, desktop + fine-pointer only: a very subtle parallax where the wordmark shifts a few pixels opposite the cursor, for depth. Skip this one entirely if it adds any risk of visual glitches — it's a nice-to-have, not a requirement.
Respect prefers-reduced-motion: reduce globally — every animation/transition should collapse to near-instant for anyone with that setting on.

Don't add anything beyond this list (no bouncing scroll indicators, no spinning icons, no random floating shapes) — restraint is part of what makes this look designed rather than generated.

8. Accessibility & performance
Semantic HTML5 (header, nav, main, section, h1).
The wordmark and the 3D-model container are decorative — mark both aria-hidden="true".
Visible focus states on every interactive element (button, links) — never remove the outline without replacing it.
Text contrast: white/light-gray on near-black comfortably clears WCAG AA.
The hamburger button needs aria-expanded and aria-controls, and its aria-label should flip between "Open menu" / "Close menu".
Spline/WebGL is heavy — don't add anything else render-blocking above the fold.
9. Reference implementation — use this as your source of truth

This has already been built and reviewed against every requirement above. If nothing else has been requested, output it as-is. If you're asked to integrate it into an existing site/theme, adapt carefully and preserve everything specified above (copy, tokens, layering, breakpoints).

html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<title>EigenSol — Shaping the Future of Software</title>
<meta name="description" content="EigenSol builds software that helps businesses run smarter." />

<!-- Fallback display font (Orbitron) while Neuropol X Heavy Expanded is licensed/hosted — see notes above -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700;800;900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

<!-- Spline 3D viewer (single instance) -->
<script type="module" src="https://unpkg.com/@splinetool/viewer@1.12.98/build/spline-viewer.js"></script>

<style>
  :root {
    --bg: #08080b;
    --bg-soft: #131318;
    --text-primary: #ffffff;
    --text-secondary: #a4a4b0;
    --hairline: rgba(255, 255, 255, 0.5);
    --focus: #7fd6ff;

    /* Swap in the real font once licensed: 'Neuropol X Heavy Expanded' */
    --font-display: 'Neuropol X', 'Orbitron', sans-serif;
    --font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

    --pad-x: clamp(20px, 6vw, 64px);
  }

  /* Uncomment once you have a licensed, hosted copy of the font:
  @font-face {
    font-family: 'Neuropol X';
    src: url('/fonts/NeuropolXHeavyExpanded.woff2') format('woff2'),
         url('/fonts/NeuropolXHeavyExpanded.woff') format('woff');
    font-weight: 800;
    font-style: normal;
    font-stretch: expanded;
    font-display: swap;
  }
  */

  * { margin: 0; padding: 0; box-sizing: border-box; }
  html { -webkit-text-size-adjust: 100%; }
  body {
    background: var(--bg);
    color: var(--text-primary);
    font-family: var(--font-body);
    line-height: 1.5;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  a { color: inherit; }
  button { font: inherit; color: inherit; background: none; border: none; cursor: pointer; }
  ul { list-style: none; }

  a:focus-visible, button:focus-visible {
    outline: 2px solid var(--focus);
    outline-offset: 3px;
    border-radius: 2px;
  }

  /* ---------- Hero shell ---------- */
  .hero {
    position: relative;
    min-height: 100vh;
    min-height: 100dvh;
    width: 100%;
    overflow: hidden;
    background:
      radial-gradient(ellipse 80% 55% at 50% 28%, var(--bg-soft) 0%, var(--bg) 65%);
    isolation: isolate; /* keeps this section's stacking self-contained when dropped into a larger theme */
  }

  .hero::after { /* soft vignette so the busy 3D scene stays subordinate to the text */
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 70% 70% at 50% 45%, transparent 40%, #000 100%);
    opacity: 0.45;
    pointer-events: none;
    z-index: 15;
  }

  /* ---------- Header ---------- */
  .hero__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: clamp(18px, 3vw, 32px) var(--pad-x);
    position: relative;
    z-index: 50;
    animation: fadeDown 0.7s ease-out both;
  }

  .logo {
    font-family: var(--font-display);
    font-weight: 800;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    font-size: clamp(1.05rem, 1.6vw, 1.35rem);
    text-decoration: none;
  }

  .nav-toggle {
    position: relative;
    width: 30px;
    height: 20px;
    flex-shrink: 0;
  }
  .nav-toggle span {
    position: absolute;
    left: 0;
    width: 100%;
    height: 2px;
    background: #fff;
    border-radius: 2px;
    transition: transform 0.35s cubic-bezier(0.65, 0, 0.35, 1), opacity 0.25s ease, top 0.35s ease;
  }
  .nav-toggle span:nth-child(1) { top: 0; }
  .nav-toggle span:nth-child(2) { top: 9px; }
  .nav-toggle span:nth-child(3) { top: 18px; }
  .nav-toggle[aria-expanded="true"] span:nth-child(1) { top: 9px; transform: rotate(45deg); }
  .nav-toggle[aria-expanded="true"] span:nth-child(2) { opacity: 0; }
  .nav-toggle[aria-expanded="true"] span:nth-child(3) { top: 9px; transform: rotate(-45deg); }

  /* ---------- Full-screen nav overlay ---------- */
  .nav-overlay {
    position: fixed;
    inset: 0;
    background: rgba(6, 6, 8, 0.97);
    backdrop-filter: blur(6px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: clamp(20px, 4vh, 36px);
    z-index: 45;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-12px);
    transition: opacity 0.4s ease, transform 0.4s ease, visibility 0s linear 0.4s;
  }
  .nav-overlay.is-open {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
    transition: opacity 0.4s ease, transform 0.4s ease, visibility 0s;
  }
  .nav-overlay a {
    font-family: var(--font-display);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-size: clamp(1.4rem, 3vw, 2rem);
    text-decoration: none;
    color: #fff;
    opacity: 0;
    transform: translateY(10px);
    transition: opacity 0.4s ease, transform 0.4s ease, color 0.2s ease;
  }
  .nav-overlay.is-open a { opacity: 1; transform: translateY(0); }
  .nav-overlay.is-open li:nth-child(1) a { transition-delay: 0.05s; }
  .nav-overlay.is-open li:nth-child(2) a { transition-delay: 0.1s; }
  .nav-overlay.is-open li:nth-child(3) a { transition-delay: 0.15s; }
  .nav-overlay.is-open li:nth-child(4) a { transition-delay: 0.2s; }
  .nav-overlay a:hover, .nav-overlay a:focus-visible { color: var(--focus); }

  /* ---------- Giant background wordmark ---------- */
  .hero__wordmark-wrap {
    z-index: 5;
    pointer-events: none;
    text-align: center;
    margin: 4px auto 0;
  }
  .hero__wordmark {
    display: inline-block;
    font-family: var(--font-display);
    font-weight: 800;
    text-transform: uppercase;
    font-size: clamp(2.1rem, 13vw, 4rem);
    letter-spacing: 0.01em;
    color: rgba(255, 255, 255, 0.05); /* faint fallback fill if text-stroke is unsupported */
    -webkit-text-stroke: 1.4px rgba(255, 255, 255, 0.9);
    white-space: nowrap;
    user-select: none;
    opacity: 0;
    animation: wordmarkIn 1s ease-out 0.1s forwards, wordmarkGlow 4.5s ease-in-out 1.2s infinite alternate;
  }

  /* ---------- Spline 3D viewer ---------- */
  .hero__spline {
    position: relative;
    width: 100%;
    height: min(50vh, 420px);
    z-index: 10;
  }
  .hero__spline spline-viewer {
    display: block;
    width: 100%;
    height: 100%;
    background: transparent;
  }

  /* ---------- Content blocks ---------- */
  .hero__content { position: relative; z-index: 30; padding: 0 var(--pad-x); }
  .hero__content--left { padding-top: 20px; animation: riseIn 0.8s 0.25s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
  .hero__content--right { padding-top: 18px; padding-bottom: 56px; animation: riseIn 0.8s 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) both; }

  .headline {
    font-family: var(--font-display);
    font-weight: 800;
    font-size: clamp(1.9rem, 4.4vw, 3.4rem);
    line-height: 1.1;
    letter-spacing: 0.01em;
    text-shadow: 0 4px 30px rgba(255, 255, 255, 0.15);
  }

  .hero__content--right p {
    color: var(--text-secondary);
    font-size: clamp(0.95rem, 1.05vw, 1.08rem);
    line-height: 1.65;
    max-width: 46ch;
    margin-bottom: clamp(20px, 3vh, 28px);
  }

  .cta-button {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    padding: 14px 26px;
    border: 1px solid var(--hairline);
    border-radius: 6px;
    font-family: var(--font-body);
    font-weight: 600;
    letter-spacing: 0.03em;
    font-size: 0.95rem;
    text-decoration: none;
    color: #fff;
    background: rgba(255, 255, 255, 0.02);
    transition: background 0.3s ease, border-color 0.3s ease, color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
  }
  .cta-button svg { width: 18px; height: 18px; transition: transform 0.3s ease; flex-shrink: 0; }
  .cta-button:hover, .cta-button:focus-visible {
    background: #fff;
    color: #0a0a0d;
    border-color: #fff;
    box-shadow: 0 0 30px rgba(255, 255, 255, 0.35);
    transform: translateY(-2px);
  }
  .cta-button:hover svg, .cta-button:focus-visible svg { transform: translateX(3px); }

  /* ---------- Keyframes ---------- */
  @keyframes fadeDown { from { opacity: 0; transform: translateY(-16px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes riseIn { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes wordmarkIn { from { opacity: 0; filter: blur(6px); } to { opacity: 1; filter: blur(0); } }
  @keyframes wordmarkGlow {
    from { text-shadow: 0 0 25px rgba(255, 255, 255, 0.14); }
    to   { text-shadow: 0 0 55px rgba(255, 255, 255, 0.32); }
  }

  /* ================= Desktop enhancement ================= */
  /* Base layout above is a simple stacked flow (mobile-safe by default).
     From 860px up, we lift elements into the absolute corner layout from the reference. */
  @media (min-width: 860px) {
    .hero__header { position: absolute; top: 0; left: 0; right: 0; }

    .hero__wordmark-wrap {
      position: absolute;
      left: 50%;
      top: 38%;
      transform: translate(-50%, -50%);
      margin: 0;
      transition: transform 0.3s ease-out; /* smooths the JS parallax below */
    }
    .hero__wordmark { font-size: clamp(4rem, 12vw, 11rem); }

    .hero__spline { position: absolute; inset: 0; height: 100%; }

    .hero__content {
      position: absolute;
      bottom: clamp(56px, 9vh, 108px);
      max-width: min(440px, 38vw);
      padding: 0;
    }
    .hero__content--left { left: var(--pad-x); }
    .hero__content--right { right: var(--pad-x); }
  }

  /* ---------- Reduced motion ---------- */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
</style>
</head>
<body>

<main>
  <section class="hero" id="top">

    <header class="hero__header">
      <a class="logo" href="#top">EigenSol</a>
      <button class="nav-toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="navOverlay">
        <span></span><span></span><span></span>
      </button>
    </header>

    <nav class="nav-overlay" id="navOverlay">
      <ul>
        <li><a href="#">Home</a></li>
        <li><a href="#">About</a></li>
        <li><a href="#">Work</a></li>
        <li><a href="#">Contact</a></li>
      </ul>
    </nav>

    <div class="hero__wordmark-wrap">
      <span class="hero__wordmark" aria-hidden="true">EIGENSOL</span>
    </div>

    <div class="hero__spline" aria-hidden="true">
      <spline-viewer url="https://prod.spline.design/z9oGue1tXFC9pUEF/scene.splinecode"></spline-viewer>
    </div>

    <div class="hero__content hero__content--left">
      <h1 class="headline">Shaping the<br />Future of Software</h1>
    </div>

    <div class="hero__content hero__content--right">
      <p>EigenSol builds software that helps businesses run smarter — from the systems behind the scenes to the tools your team uses every day. Clean engineering, thoughtful design, and code built to scale with you.</p>
      <a class="cta-button" href="#work">
        <span>See Our Work</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9"></circle>
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <path d="M12 3c2.5 2.7 4 6 4 9s-1.5 6.3-4 9c-2.5-2.7-4-6-4-9s1.5-6.3 4-9z"></path>
        </svg>
      </a>
    </div>

  </section>
</main>

<script>
(function () {
  var toggle = document.querySelector('.nav-toggle');
  var overlay = document.querySelector('.nav-overlay');

  function setNav(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    overlay.classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }

  toggle.addEventListener('click', function () {
    setNav(toggle.getAttribute('aria-expanded') !== 'true');
  });

  overlay.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () { setNav(false); });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setNav(false);
  });

  // Subtle parallax on the wordmark — desktop, fine-pointer only, respects reduced motion.
  var wrap = document.querySelector('.hero__wordmark-wrap');
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(pointer: fine)').matches;

  if (wrap && fine && !prefersReduced) {
    var hero = document.querySelector('.hero');
    var mq = window.matchMedia('(min-width: 860px)');

    hero.addEventListener('mousemove', function (e) {
      if (!mq.matches) return;
      var x = (e.clientX / window.innerWidth - 0.5) * 16;
      var y = (e.clientY / window.innerHeight - 0.5) * 10;
      wrap.style.transform = 'translate(calc(-50% + ' + x + 'px), calc(-50% + ' + y + 'px))';
    });
    hero.addEventListener('mouseleave', function () {
      if (mq.matches) wrap.style.transform = 'translate(-50%, -50%)';
    });
  }
})();
</script>

</body>
</html>
10. Acceptance checklist — verify before finishing
 Logo reads "EigenSol", giant wordmark reads "EIGENSOL", headline/paragraph/button copy match §2 exactly
 Spline script + <spline-viewer> each appear exactly once
 Display font variable is used for logo/wordmark/headline; body font for paragraph/button/nav
 All colors match the tokens in §4 — no added accent colors
 Layout is a simple stacked flow below 860px, and matches the ASCII diagram in §6 at 860px and above
 Wordmark fades in, then glow-pulses continuously; header and content blocks fade/rise in on load; button has a hover/focus state; hamburger morphs to X and opens a full-screen menu
 Everything still works with JavaScript animations disabled/instant under prefers-reduced-motion
 No console errors, no unclosed tags, no orphaned CSS braces
 Keyboard: can tab to logo, hamburger, nav links, and button, each with a visible focus ring; Escape closes the open menu
 Tested (or at least reasoned through) at 320px, 375px, 768px, 1024px, and 1440px+ widths
11. Do not
Don't invent different copy than §2, even if you think it reads better
Don't add a bright accent color, gradient background, or extra decorative elements not listed above
Don't use a JS framework, CSS framework, or build tool — plain HTML/CSS/JS only
Don't include the Spline embed more than once
Don't remove focus outlines without providing a replacement
Don't skip the mobile layout in favor of only building the desktop corner-anchored version
PROMPT END
Notes for you (not part of the prompt above)

Using this in WordPress/Elementor, since that's where the reference screenshot came from: drop the <section class="hero">…</section> markup into an HTML/Custom Code widget or a full-width Elementor section set to "Full Height," and move the <style>, the two <link> tags, and the Spline <script> into your theme's <head> (via a plugin like Insert Headers and Footers, or your child theme's header.php) rather than leaving them inline — Elementor pages sometimes strip raw <script>/<style> tags pasted directly into content widgets. If your theme already injects its own header/nav, you'll likely want this hero on a page template with the theme header disabled, so you don't end up with two navigation bars.

On the font: once you've licensed Neuropol X Heavy Expanded and have the actual font files, host them yourself (don't hotlink from a font-download site) and update the commented @font-face block with the real file paths. Orbitron will keep working as the fallback for any visitor whose browser hasn't loaded the custom font yet.

Want me to just build this directly right now instead of routing it through another model? I already have the working version — happy to adjust colors, copy, or layout details on it directly.
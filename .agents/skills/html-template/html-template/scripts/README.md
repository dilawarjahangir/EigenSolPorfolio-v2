# html-template Scripts

Three focused check scripts, one convenience wrapper, and a scaffolder. Each check
accepts files or directories and prints findings as:

```
path:line: [SEVERITY] [RULE] message
```

`node_modules`, `.git`, `dist`, `build`, `.next`, `coverage`, and `__pycache__` are
skipped. Severities are `WARN` (fix it) and `INFO` (consider it).

### Exit Codes

| Code | Meaning |
| ---- | ------- |
| 0 | No findings |
| 1 | Findings emitted |
| 2 | Bad invocation |

---

## check.py (wrapper)

Runs all three checks in one pass.

```bash
python3 check.py local/html-template/
```

## check-structure.py

Bucket layout + required docs. Infers the template root from the paths; only asserts
when the path looks like a template (a bucket dir or a required doc is present).

| Rule | Severity | Description |
| ---- | -------- | ----------- |
| doc-missing | WARN | A required root doc (`METADATA.md`, `AGENTS.md`, `README.md`, `PAGES_AND_SECTIONS.md`) is absent. |
| bucket-missing | INFO | `site/`, `components/`, or `sample-pages/` not found. |
| layouts-missing | INFO | `sample-pages/` present but no `layouts/` folder. |
| section-folder-missing-html | WARN | A sample section folder has `.css`/`.js` but no `.html` entry. |

```bash
python3 check-structure.py local/html-template/
```

## check-styling.py

Enforces the `.es__` prefix and token discipline across `.css` and `.html`.

| Rule | Severity | Description |
| ---- | -------- | ----------- |
| tailwind-utility | WARN | A class looks like a Tailwind/utility class (`flex`, `px-4`, `md:text-lg`, `bg-[#…]`). |
| unprefixed-class | INFO | A class is not prefixed `es__` / `es--` (and not an allow-listed third-party class). |
| inline-style-hex | INFO | An inline `style="…#hex…"` color — move to a class + token. |
| hardcoded-hex | INFO | A raw `#hex` in section CSS — prefer a `--es-*` token (`global.css` is exempt). |

Allow-listed unprefixed classes: `swiper-*`, `lenis`, `lucide`, `gsap*`, `sr-only`, `clearfix`.

```bash
python3 check-styling.py local/html-template/site/
```

## check-sections.py

Section hygiene in HTML pages.

| Rule | Severity | Description |
| ---- | -------- | ----------- |
| section-missing-banner | WARN | A `<section>` has no `SECTION:` / `LAYOUT:` / `CATALOG:` comment banner above it. |
| style-not-colocated | INFO | A page has `<section>`s but no in-body `<style>` (section CSS should sit above its section). Skipped for `sample-pages/` folders, which use an external `<section>.css`. |

```bash
python3 check-sections.py local/html-template/site/
```

---

## init.py (scaffolder)

Bootstraps a fresh template skeleton (all three buckets + `global.css` + a worked hero
example in all three forms + a buttons catalog + header/footer layouts + the four docs).
The output passes the checks out of the box.

```bash
python3 init.py local/html-template          # refuses if target is non-empty
python3 init.py local/html-template --force   # write anyway
```

---

## Shared module

`_common.py` holds the `Finding` class, path/segment helpers, the HTML/CSS scanners, the
Tailwind-utility detector, the `.es__` allow-list, and the `run_checks` driver. Not run
directly.

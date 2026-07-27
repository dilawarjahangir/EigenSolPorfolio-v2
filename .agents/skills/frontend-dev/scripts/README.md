# Frontend Scripts

Seven focused check scripts plus one convenience wrapper. Each script
accepts files or directories and prints findings as:

```
path:line: [SEVERITY] [RULE] message
```

### Exit Codes

| Code | Meaning |
| ---- | ------- |
| 0    | No findings |
| 1    | Findings emitted |
| 2    | Bad invocation |

---

## check.py (wrapper)

Runs **all seven** check scripts in one pass. Use when you want a full audit.

```bash
python3 check.py src/
```

---

## check-structure.py

Project layout, layouts, naming, and file sizes.

```bash
python3 check-structure.py src/
```

| Rule                       | Severity | Description |
| -------------------------- | -------- | ----------- |
| domain-folder-in-components| WARN     | A lowercase folder under `components/` not in the type whitelist. |
| vague-component-folder     | WARN     | `components/utils/`, `helpers/`, `common/`, `shared/`, `misc/`, `global/`. |
| vendor-named-component     | WARN     | Component file name starts with `Mui*`, `Ant*`, `Radix*`, `Chakra*`, `Mantine*`, `Bootstrap*`. |
| vague-file-in-components   | WARN     | `data.ts` / `types.ts` / `helpers.ts` / `utils.ts` inside `components/` or `layouts/`. |
| layout-without-folder      | WARN     | `layouts/Foo.tsx` should be `layouts/Foo/Foo.tsx`. |
| layout-components-flat     | WARN     | `layouts/components/<X>.tsx` — move under `layouts/<LayoutName>/partials/`. |
| mixed-case-folder          | INFO     | One folder mixes CapitalCase and camelCase source files. |
| large-component            | INFO     | Component (`.tsx`/`.jsx`) > 200 lines. |
| large-file                 | INFO     | Other source file > 400 lines. |

---

## check-routing.py

Route file and lazy-loading rules.

```bash
python3 check-routing.py src/routes/
```

| Rule                  | Severity | Description |
| --------------------- | -------- | ----------- |
| route-file-tsx        | WARN     | Route file uses `.tsx`/`.jsx` — route files are data, must be `.ts`/`.js`. |
| route-renders-jsx     | WARN     | Route file contains JSX or `import React`. |
| route-with-layout-hoc | WARN     | `withXxxLayout()` wrapper in route file — page imports its layout directly. |
| route-non-lazy-page   | INFO     | Page imported eagerly in a route group — consider `React.lazy`. |

---

## check-pages.py

Page placement, naming, and sections rules.

```bash
python3 check-pages.py src/pages/
```

| Rule                 | Severity | Description |
| -------------------- | -------- | ----------- |
| page-outside-role    | WARN     | Page file directly under `pages/` — move into `pages/<role>/<PageName>/`. |
| page-name-mismatch   | INFO     | File inside `pages/<role>/<PageName>/` does not match `PageName`. |
| section-outside-page | INFO     | `*Section.tsx` found in `components/` — move to `pages/<page>/sections/`. |

---

## check-components.py

Shared component organization rules.

```bash
python3 check-components.py src/components/
```

| Rule                       | Severity | Description |
| -------------------------- | -------- | ----------- |
| domain-folder-in-components| WARN     | A lowercase folder under `components/` not in the type whitelist. |
| vague-component-folder     | WARN     | `components/utils/`, `helpers/`, `common/`, `shared/`, etc. |
| vendor-named-component     | WARN     | Component file name starts with vendor prefix (`Mui*`, `Ant*`, …). |
| vague-file-in-components   | WARN     | `data.ts` / `types.ts` / `helpers.ts` inside `components/` or `layouts/`. |

---

## check-a11y.py

Accessibility rules for JSX / Vue / Svelte files.

```bash
python3 check-a11y.py src/pages/guest/Home/
python3 check-a11y.py src/
```

| Rule                   | Severity | Description |
| ---------------------- | -------- | ----------- |
| img-missing-alt        | WARN     | `<img>` without `alt`. |
| img-missing-dimensions | INFO     | `<img>` without `width`/`height` (CLS risk). |
| non-button-click       | WARN     | `<div>`/`<span>` with `onClick` — use `<button>`. |
| label-missing-for      | INFO     | `<label>` without `htmlFor`/`for`. |
| removed-focus-outline  | WARN     | `outline: none` with no replacement. |
| tabindex-positive      | WARN     | Positive `tabIndex` disrupts focus order. |

---

## check-styling.py

CSS/SCSS and inline style rules.

```bash
python3 check-styling.py src/
python3 check-styling.py src/styles/ src/components/
```

| Rule              | Severity | Description |
| ----------------- | -------- | ----------- |
| inline-style      | INFO     | `style={{...}}` (use classes / tokens). |
| hardcoded-color   | INFO     | `#hex` / `rgb()` literal in a component file. |
| giant-global-css  | WARN     | `App.css` / `index.css` / `globals.css` over 80 lines. |
| css-important     | INFO     | `!important` in CSS. |

---

## check-correctness.py

General React/JS correctness checks.

```bash
python3 check-correctness.py src/
python3 check-correctness.py src/components/tables/Table/Table.tsx
```

| Rule              | Severity | Description |
| ----------------- | -------- | ----------- |
| missing-key       | WARN     | `.map()` returning JSX without `key`. |
| key-from-index    | WARN     | Array index used as React `key`. |
| direct-dom        | WARN     | `document.querySelector`/`getElementById` in a component. |
| unsafe-html       | WARN     | `dangerouslySetInnerHTML` / `v-html`. |
| inline-secret     | WARN     | Hardcoded-looking secret/token/key. |
| stray-console     | INFO     | `console.log`/`debug` left in source. |
| large-component   | INFO     | Component (`.tsx`/`.jsx`) > 200 lines. |
| large-file        | INFO     | Other source file > 400 lines. |

---

## Shared Module

`_common.py` contains the `Finding` class, path helpers, config constants,
and the `run_checks` driver used by all scripts. Not intended to be run
directly.

## Folder Heuristics

A file's role is inferred from its path:

- `routes/*` → route file rules apply.
- `pages/*` → page placement and naming rules apply.
- `components/*` → component organization rules apply.
- `layouts/*` → layout organization rules apply.

These can mix freely with content-level rules (accessibility, etc.) when
the file is JSX / TSX / Vue / Svelte.

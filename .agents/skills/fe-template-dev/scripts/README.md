# fe-template-dev Scripts

Five focused check scripts plus one convenience wrapper. Each accepts files or
directories and prints findings as:

```
path:line: [SEVERITY] [RULE] message
```

A file's **layer** and **role** are inferred from its path segments, so the
scripts work in a monorepo (`packages/ui/src/...`) **and** in a flat project
being extracted into a template (`src/...`). `node_modules`, `.git`, `dist`,
`build`, `.next`, and `coverage` are skipped.

### Exit Codes

| Code | Meaning |
| ---- | ------- |
| 0    | No findings |
| 1    | Findings emitted |
| 2    | Bad invocation |

---

## check.py (wrapper)

Runs **all five** checks in one pass. Use for a full audit.

```bash
python3 check.py packages/ui/src/
python3 check.py src/            # a flat project being extracted
```

---

## check-structure.py

Library / component-folder layout, naming, export hygiene, and file sizes.

```bash
python3 check-structure.py packages/ui/src/
```

| Rule | Severity | Description |
| --- | --- | --- |
| component-not-in-folder | INFO | A component file directly under a type folder (`atoms/Button.tsx`) — give it its own folder (`atoms/Button/Button.tsx`). |
| vague-component-folder | WARN | `components/utils/`, `helpers/`, `common/`, `shared/`, `misc/`, `global/`. |
| vague-file-in-components | WARN | `data.ts` / `types.ts` / `helpers.ts` inside `components/` — use co-located `<Name>.fixtures.ts` / `<Name>.types.ts` or `mocks/`. |
| default-export-component | INFO | A library component uses `export default` — prefer named exports for clean barrels. |
| large-component | INFO | Component (`.tsx`/`.jsx`) > 200 lines. |
| large-file | INFO | Other source file > 400 lines. |

---

## check-tokens.py

Token-first enforcement: no styling literals in component source. Skips
`tokens/`, `themes/`, the catalog, `mocks/`, and tests (those legitimately hold
literal values).

```bash
python3 check-tokens.py packages/ui/src/components/
```

| Rule | Severity | Description |
| --- | --- | --- |
| hardcoded-hex | WARN | `#hex` color literal in component source — use a token class. |
| arbitrary-tw-color | WARN | Tailwind arbitrary color value (`bg-[#...]`, `text-[rgb(...)]`). |
| color-fn | INFO | `rgb()` / `hsl()` literal in component source. |
| arbitrary-tw-length | INFO | Tailwind arbitrary length (`w-[123px]`) — prefer a spacing/size token. |
| raw-font-family | INFO | `font-family:` literal — use the font token. |
| raw-px | INFO | Raw `px` literal — prefer a spacing/size token. |

---

## check-layers.py

Down-only import direction and token purity.

```bash
python3 check-layers.py packages/ui/src/
```

| Rule | Severity | Description |
| --- | --- | --- |
| upward-import | WARN | A lower-layer file imports a higher layer (e.g. an atom importing a composite). |
| token-has-react | WARN | A file under `tokens/` imports React or uses a JSX extension — tokens are pure `.ts`. |
| component-imports-theme | WARN | A component imports from `tokens/themes/*` — read tokens via classes, not theme objects. |

Layer ranks: `tokens=1`, `atoms/forms/icons=2`, composites (`surfaces/overlays/data/charts/...`)`=3`, sections/domain (`navigation/layout/auth/marketing/domain=4`), `templates/patterns=5`.

---

## check-catalog.py

Catalog and fixture hygiene.

```bash
python3 check-catalog.py apps/catalog/
```

| Rule | Severity | Description |
| --- | --- | --- |
| fixture-imports-kit | WARN | A file under `mocks/` / `fixtures/` imports the UI kit (`@org/ui` or a `components/` path). `import type` is allowed. |
| catalog-network | WARN | A catalog page calls `fetch` / `axios` / `useQuery` / etc. — use a fixture or MSW, never a real backend. |

---

## check-consumption.py

Rules for a downstream app that consumes the template.

```bash
python3 check-consumption.py src/
```

| Rule | Severity | Description |
| --- | --- | --- |
| deep-import | WARN | `@org/ui/src/...` / `/dist/` / `/components/` deep import — import from the package root only. |
| theme-brand-branch | WARN | Branching on `theme` / `brand` in source — fix the token, not the component. (Theme-infra files are exempt.) |
| override-prop | WARN | A `themeOverride` / `customColor` style prop punches through tokens — use a variant or token. |
| inline-style-hex | INFO | Inline `style={{...}}` with a hex color overrides theming. |

---

## Shared Module

`_common.py` holds the `Finding` class, path/segment helpers, layer inference,
import-specifier extraction, config constants, and the `run_checks` driver used
by all scripts. Not intended to be run directly.

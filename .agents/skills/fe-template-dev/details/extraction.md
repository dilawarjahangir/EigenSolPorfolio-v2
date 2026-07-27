# Extracting a Template from an Existing Project

> Workflow B. Carve a reusable template out of a project that already exists (often a legacy
> app). The target architecture is identical to greenfield — you just reach it by migration,
> not by scaffolding. Frequently paired with producing a **mock copy** of the original app
> (a ditto front-end with no backend) plus the **template** (the extracted reusable set).

## Principle: promote, don't lift-and-shift

Move a piece into the template only when it is **generic** and **reused by 2+ surfaces**.
Everything app-unique stays in the app. Extraction is mostly *deletion and genericization*,
not copying.

## Order of operations

### 1. Inventory & audit

Run the checks against the existing source to map the work:

```bash
python3 skills/fe-template-dev/scripts/check-structure.py src/
python3 skills/fe-template-dev/scripts/check-tokens.py src/
python3 skills/fe-template-dev/scripts/check-layers.py src/
```

Catalogue: duplicated UI, hard-coded colors/spacing, domain-named "shared" components
(`TeamMembersTable`, `PublishRunTable`), components that fetch their own data, `data.ts` /
`types.ts` dumped in component folders, one giant `App.css`/`index.css`.

### 2. Extract the token layer FIRST

- Pull the real palette, spacing, radii, type scale, and shadows out of existing CSS into
  semantic tokens (`tokens/*.ts`) + a `default-light` theme. Add `default-dark` if the app has one.
- Replace literals with token classes as you go (`#0a7cff` → `bg-brand-500`, `12px` → `p-3`).
- Validate with `validateTheme()`. See `tokens-and-theming.md`. Nothing else moves until tokens exist.

### 3. Stand up the library shell

- Create `packages/ui` (and `apps/catalog`) — or, if a monorepo is overkill now, an internal
  `src/ui/` that you later split out. The layout and rules are the same either way.
- Wire the Tailwind preset + `globals.css` so token classes resolve. See `monorepo-setup.md`.

### 4. Migrate by layer, atoms first

Move generic pieces up the layer ladder:
- **Atoms** (Button, Input, Badge) → genericize variants, remove inline styles, add states.
- **Composites** (Card, Modal, Table) → strip domain copy; expose `columns`/`rows`/slots.
- **Sections / domain** → only those 2+ surfaces share; the rest stay app-local.
- **Templates** → extract repeated page shells (sidebar+header+main) as slot-only layouts.

### 5. Genericize each migrated piece

| Found in the old project | Becomes in the template |
| --- | --- |
| `TeamMembersTable.tsx` (domain-named) | `Table` with `columns` + `rows` props |
| Component calling `fetch`/`useQuery` | Component takes typed data via props; the app fetches |
| `#hex` / `px` / font-stack literals | token classes resolving to CSS variables |
| `data.ts` inside the component | `apps/catalog/src/mocks/<name>.fixtures.ts` |
| Product/brand strings baked in | props/tokens; no product name in component source |
| `if (theme === 'dark')` branches | a token value difference, not a code branch |

A migrated component is **done** only when it has a catalog page covering all variants + states
(see `catalog.md`).

### 6. Point the original project at the package

Replace the project's local components with imports from `@org/ui`. The original app becomes the
**first consumer** and proves the API (see `consumption.md`). This is also where the **mock copy**
is produced: the same screens, fed by fixtures instead of a backend, importing the extracted kit.

### 7. Iterate

Promote additional pieces only as a second surface needs them. Resist extracting speculative
components — the catalog must never grow pieces that are not actually reused.

## Producing the two artifacts (mock-copy + template)

A common extraction goal is two outputs:
- **Project (mock copy):** a faithful front-end of the original app with all controllers/DB
  removed — every data source is a fixture/mock. It consumes the template.
- **Template:** the generic, reusable element set extracted along the way.

Keep them cleanly separated: the template carries zero app-specific assembly or data; the mock
copy carries the app's page composition and fixtures and depends on the template.

## Anti-patterns specific to extraction

- Lifting whole folders into the template unchanged (drags domain coupling + hardcoded styles in).
- Keeping hard-coded colors "for now" — they never get cleaned up; tokenize on the way in.
- Extracting a component only one screen uses (premature generalization).
- Recreating the backend's data shapes as component props (couples the kit to one app).
- Skipping the catalog because "it already works in the app" — undocumented = unmaintained.

## Extraction checklist

- [ ] Token layer extracted and validated before any component moved.
- [ ] Every migrated component is token-only (checks pass), generic, and prop-driven.
- [ ] No domain/product name survives in component source or token names.
- [ ] Each migrated component has a catalog page with all states reachable.
- [ ] The original project imports from the package (no forked copies remain).
- [ ] Only pieces shared by 2+ surfaces were promoted; app-unique pieces stayed local.

# Sample-Page Catalog Convention

> The catalog is the template's primary documentation surface and the target of
> visual-regression + a11y tests. **If a variant is not on a sample page, it is not in the kit.**

## Where pages live

- All catalog pages mount under `/sample/*` in `apps/catalog/`.
- The site root (`/sample`) is the index — a navigable list grouped by category.
- Each page is a thin `page.tsx` that imports from `@org/ui` and renders. Never a private path.

## What every page must show

1. **Every visual variant**, side by side, labelled.
2. **Every state** (`default/hover/focus-visible/active/disabled/loading/empty/error/coming-soon`) reachable via top-of-page toggles.
3. **Every size** in a consistent strip.
4. **A "with content" example** using realistic mock data (not lorem ipsum).
5. **An "edge case" example**: long text, narrow container, RTL, very large numbers, missing optional props.
6. **The public type** as a small read-only block (generated from `.types.ts`).

A page missing any of these is incomplete.

## Page anatomy

```
PageHeader (name + description)
VariantControls (state / size / theme / brand / density / direction toggles)
── Section 1: Variants
── Section 2: Sizes
── Section 3: States
── Section 4: With realistic content
── Section 5: Edge cases
PublicAPI (typed props)   ·   ChangeNotes (from the component's CHANGELOG entry)
```

## Categories & required pages

| Category | Pages |
| --- | --- |
| `foundations` | `colors`, `typography`, `spacing`, `radii-shadows-motion`, `icons` |
| `atoms` | `buttons`, `badges`, `avatars`, `indicators`, `misc` |
| `forms` | `text`, `choice`, `date-time`, `files`, `colors-and-ranges`, `layout` |
| `feedback` | `inline`, `toasts`, `states` |
| `surfaces` | `cards`, `containers` |
| `overlays` | `modals`, `menus` |
| `navigation` | `shells`, `sidebar`, `header`, `wayfinding` |
| `layout` | `primitives` |
| `data` | `tables`, `lists` |
| `charts` | `cards` (every chart variant on one page) |
| `auth` | `login`, `register`, `forgot-password`, `invite-accept` |
| `marketing` | `home`, `how-it-works`, `features`, `pricing`, `contact`, `legal`, `checkout` |
| `domain` | one page per `domain/<module>` you ship |
| `patterns` | one page per page template (`dashboard`, `list`, `detail`, `auth`, …) |

A new exported symbol with no catalog cell fails CI.

## Mock data conventions

- Fixtures live in `apps/catalog/src/mocks/`, typed with the components' public types.
- Each fixture exports a **small** set (3–10, inline examples) and a **large** set (~100, for pagination/virtualisation).
- No personal/real data — deterministic generators only (`user-001@example.test`).
- **A fixture must never import `@org/ui`.** Components depend on fixtures, never the reverse.

## State toggling

Top-of-page controls: `state` select (`default/empty/loading/error`), `disabled` checkbox,
`coming-soon` toggle, `density` (`compact/comfortable`), `direction` (`ltr/rtl`), `theme`
(`light/dark`), `brand` (when >1 registered). Selections persist to the query string so review
URLs reproduce exact state.

## Theme & brand switcher

Global header switches `data-theme` / `data-brand` on `<html>` and `localStorage`, with no
re-mount. The index renders a colour-swatch overview of the active brand.

## Visual regression & a11y

- Playwright snapshots every page at `360px / 1024px / 1440px`, across `light × default`,
  `dark × default`, plus one brand override. A failing snapshot blocks CI.
- `axe-core` runs on every page; any `serious`/`critical` violation fails CI. Interaction-heavy
  pages also get a keyboard-only script (open, traverse, close, restore focus).

## Catalog index = one typed registry

```ts
export type CatalogEntry = {
  id: string;            // 'atoms.buttons'
  category: string;      // 'atoms'
  title: string;         // 'Buttons'
  path: string;          // '/sample/atoms/buttons'
  components: string[];  // ['Button', 'IconButton', ...]
  states: ReadonlyArray<'default'|'empty'|'loading'|'error'|'disabled'|'coming-soon'>;
  brands?: string[];
};
```

Adding a page = adding a row. The index, the visual-regression matrix, and the a11y suite all
read this one array — there is no second source of truth.

## Authoring workflow

1. Add/extend the component under `packages/ui/src/components/...`.
2. Add/extend a fixture in `apps/catalog/src/mocks/`.
3. Add/update `apps/catalog/.../sample/<category>/<page>/page.tsx` (variants + sizes + states).
4. Add the registry row. 5. `pnpm test` + `pnpm test:visual` + `pnpm test:a11y`. 6. Add a Changeset.

## Anti-patterns

- A page that needs a backend → use a fixture or MSW.
- A page using a real customer name/logo → mock it.
- A page secretly testing business logic → keep it visual; move logic tests to Vitest.
- Copy-pasting a component six times for six variants → map over a typed `variants` array.
- A page with no edge-case section → add one.
- A page that wraps the component in extra padding/borders → show it as the consumer sees it.

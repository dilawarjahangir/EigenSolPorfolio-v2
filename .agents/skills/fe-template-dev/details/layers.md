# The Five Component Layers

> A higher layer composes any layer below it. A lower layer **must not** import a higher one.
> ESLint (`eslint-plugin-import` / `dependency-cruiser`) enforces this; `check-layers.py` catches it.

```
Layer 5 — Page Templates     DashboardTemplate, ListTemplate, DetailTemplate, AuthTemplate
Layer 4 — Sections & Domain  page regions; domain/<module>/ composites
Layer 3 — Composites         Card, MetricCard, Modal, Drawer, Menu, Tabs, Table, chart cards
Layer 2 — Atoms              Button, Input, Badge, Avatar, Spinner, form atoms
Layer 1 — Tokens             color / type / spacing / radii / shadow / motion / z / breakpoints
```

## Layer 1 — Tokens

- Plain `.ts` files exporting plain objects. **No React, no JSX, no DOM.**
- Names are **semantic, not literal**: `color.bg.subtle` ✓, `color.gray-200` ✗.
- Emitted as CSS variables via `globals.css`; JS reads the variable, not the literal.
- Adding a token = minor; removing/renaming = major.

## Layer 2 — Atoms

- Smallest components: Button, IconButton, Badge, Pill, Tag, Avatar, Spinner, ProgressBar,
  Skeleton, Divider, Tooltip, Kbd, Code, Link, Label; form atoms (TextField, SelectField,
  CheckboxField, ToggleSwitch, SearchField, DatePicker, FileInput, ColorSwatch, Slider).
- An atom never composes another atom — a "Button with icon" is a **variant**, not a new atom.
- Accepts only token-driven props (`tone`, `size`, `variant`, `state`); `className` is for layout positioning only.
- Supports `default/hover/focus-visible/active/disabled` (+ `loading/read-only/invalid` where relevant). ARIA built in.
- Cannot fetch data, mutate global state, or render a portal.

## Layer 3 — Composites

- Cards, surfaces (Panel, Accordion, Tabs, Stepper, ScrollArea), overlays (ModalShell,
  ConfirmDialog, Drawer, Sheet, DropdownMenu, PopoverPanel, CommandPalette), tables/lists/
  pagination, chart cards.
- Compose atoms (and same-layer composites). **Headless about content** — accept children /
  items / columns / slots; never hard-coded copy.
- Many-piece composites expose **named sub-components** (`Table`, `Table.Toolbar`, `Table.EmptyState`), not monolithic boolean props.
- May render portals (Radix). Declare `state` variants (`empty/loading/error`) with a catalog cell each.

## Layer 4 — Sections & Domain

- Full page regions and `domain/<module>/` composites tied to a product concept.
- **First layer where domain terms are allowed.**
- Still content-injectable: data arrives via props/hooks; the section never calls APIs.
- Self-laid-out; expose child slots via the `<Section.Sub />` pattern; declare state variants explicitly.
- A section belongs in the template only if **2+ apps** would use it; otherwise keep it app-local.

## Layer 5 — Page Templates

- Layout functions taking slots (`header`, `sidebar`, `main`, `footer`).
- No domain logic; never decide slot contents. Own responsive behaviour once (e.g. collapse sidebar at `md`).
- The only layer that knows overall page structure exists.

## Cross-cutting rules

- **Token-only styling.** No `#hex`, `12px`, or font-stack literal in any component file.
- **No layout side-effects.** No `body{overflow:hidden}`, global shortcuts, or `localStorage` writes inside render — use opt-in hooks (`useDisclosure`, `useTheme`, `useShortcut`).
- **One state, one source.** Typed controlled props (`value`, `onChange`); `defaultValue` when the primitive supports it.
- **Typed everything.** Every public component exports its props type; variant unions are exported named types.
- **No global side-effects on import.** Importing the barrel registers nothing; effects live in explicit `<Providers>`.
- **Avoid default exports** — they make barrels and refactors noisy.

## Component folder layout

```
components/atoms/Button/
├── Button.tsx          # component
├── Button.types.ts     # exported props + variant unions
├── Button.variants.ts  # CVA recipes
├── Button.test.tsx     # Vitest + RTL
├── Button.fixtures.ts  # demo data for the catalog
├── README.md           # 5-line spec + API
└── index.ts            # named re-export
```

## Plan before writing

1. **Layer** — walk the decision tree (atom → composite → section/domain → template).
2. **Variants** — typed unions (`variant`, `tone`, `size`, `density`, `direction`); a variant is a prop, never a new file.
3. **States** — list which apply; every one gets a catalog cell.
4. **Public API** — write the `.types.ts` before the JSX; it is the contract.
5. **Slots** — named sub-components, not boolean flags.
6. **Data shape** — generic props (`columns`/`rows`), never a domain-bound shape. A `Table` that knows `TeamMember` can't render `Invoice`; one taking `columns`+`rows` renders both.
7. **Edge cases** — long text, narrow container, RTL, huge numbers, empty/1/100/100k items, missing optional props.

## Decision tree

```
Smallest primitive?                         → Layer 2 atom
Composed of atoms, no domain copy?          → Layer 3 composite
Mentions a product/feature term?
  ├─ reused by 2+ surfaces → Layer 4 domain/<module>/
  └─ one surface only      → keep app-local (not the template)
Organises a whole page layout?              → Layer 5 template
```

## Lint that enforces layering

- `import/no-internal-modules` — external imports hit `@org/ui` only, never deep paths.
- A custom rule (or `dependency-cruiser`) — lower layer cannot import upper.
- `tailwindcss/classnames-order` + `jsx-a11y` errors fail CI.

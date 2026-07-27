---
name: fe-template-dev
description: Self-contained guide to building a reusable React UI template — design tokens, multi-brand theming, layered components, a sample-page catalog, and a published package — whether starting greenfield or extracting a template out of an existing project.
---

# SKILL: Frontend Template Development

> Build one reusable UI foundation that many apps consume without rebuilding common UI.
>
> **Self-contained.** Everything needed to stand up a template lives in this file and in
> `details/`. This skill does **not** depend on any other skill and works regardless of
> where or how it is invoked.
>
> **Used alongside (not required): `frontend-dev`.** That skill governs general
> component / page / routing / a11y craft and is usually active in the same session. When it
> is present, follow it for per-component quality; follow **this** skill for everything
> template-specific (tokens, layering, catalog, packaging, consumption). If `frontend-dev`
> is absent, this skill still works end to end — the relevant craft rules are restated here.

---

## When to Use This Skill

Activate when the user asks to:
- Create a React UI template / component library / design system / shared UI kit.
- Stand up design tokens and a multi-brand theming system.
- Make components reusable across two or more apps.
- Extract or "promote" an existing project's UI into a reusable template.
- Set up a sample-page catalog that renders every component variant.
- Package, version, and publish the template for downstream apps to install.
- Theme the template for a new brand.

Two entry workflows — **both fully covered**:

| Workflow | Meaning | Start at |
| --- | --- | --- |
| **A — Greenfield** | Build the template first, then consume it in apps. | `details/monorepo-setup.md` |
| **B — Extraction** | Carve a reusable template out of an existing project. | `details/extraction.md` |

Do NOT use for:
- One-off, app-specific UI that no second surface will reuse → keep it local to that app.
- Backend / API work → not this skill.

---

## Core Principles (non-negotiable)

1. **One repository, two artifacts.** A library package (`packages/ui`) and a sample app (`apps/catalog`) live in one repo so a change to either is instantly visible.
2. **Token-first.** No hard-coded color / font / spacing / radius literal in any component source — only token references (Tailwind classes that resolve to CSS variables).
3. **Down-only layering.** tokens → atoms → composites → sections → templates. A lower layer never imports a higher one.
4. **Generic on purpose.** No product or brand name appears in component source or token names. Identity is layered on via themes.
5. **Catalog-driven.** Every variant is rendered on a sample page. If a variant is not in the catalog, it does not exist.
6. **Headless primitives + tokens, not heavy UI kits.** Behaviour from accessible unstyled primitives; appearance from the token layer.
7. **Mock data only.** The template never calls a backend; it consumes fixtures. Consumers wire real data.
8. **Reuse over rebuild.** A needed variant is added to the template, never duplicated in a consuming app.
9. **The barrel is the only contract.** Consumers import from the package root; deep imports are forbidden.

---

## Phase 1 — Detect

Run the focused check script(s) on the file(s) or folder. Each is independent — run only what applies.

| Script | Use when |
| --- | --- |
| `check-structure.py` | Auditing template repo / library layout, component-folder layout, file sizes |
| `check-tokens.py` | Enforcing token-first: no hex / rgb / px / font literals in component source |
| `check-layers.py` | Enforcing down-only imports, no deep imports, tokens stay React-free |
| `check-catalog.py` | Catalog hygiene: fixtures don't import the kit, sample pages don't call the network |
| `check-consumption.py` | Consumer code: no deep imports, no theme/brand branching, no style punch-through |

```bash
python3 skills/fe-template-dev/scripts/check.py packages/ui/src/      # full audit
python3 skills/fe-template-dev/scripts/check-tokens.py packages/ui/src/components/
python3 skills/fe-template-dev/scripts/check-layers.py packages/ui/src/
python3 skills/fe-template-dev/scripts/check-catalog.py apps/catalog/
python3 skills/fe-template-dev/scripts/check-consumption.py src/        # in a consuming app
```

Findings format: `path:line: [SEVERITY] [RULE] message`. All scripts accept files or
directories and infer a file's layer from its path, so they work in a monorepo
(`packages/ui/src/...`) **or** a flat project being extracted (`src/...`). See
`scripts/README.md` for the full rule list and exit codes.

---

## Phase 2 — Plan

Lock these decisions in order before writing code.

0. **Pick the workflow.** Greenfield (`details/monorepo-setup.md`) or Extraction
   (`details/extraction.md`). Extraction adds an inventory + genericize stage before the
   steps below; the target architecture is identical.
1. **Repo shape.** pnpm workspace; `packages/ui` (library) + `apps/catalog` (sample app);
   shared TS / Tailwind / lint config. See `details/monorepo-setup.md`.
2. **Tokens & theming first.** Define semantic token categories, emit them as CSS variables,
   ship `default-light` + `default-dark`, and the `defineTheme` / `validateTheme` brand
   mechanism — **before** any component. See `details/tokens-and-theming.md`.
3. **Layering.** Place every component in one of five layers; design its props, variants, and
   required states up front. See `details/layers.md`.
4. **Catalog convention.** Decide the category and the sample page for the component; the
   page renders all variants / sizes / states. See `details/catalog.md`.
5. **Packaging.** Barrel exports, `exports` map, `peerDependencies`, Tailwind preset,
   `globals.css`, SemVer + Changesets. See `details/packaging.md`.
6. **Consumption.** How the first (and every) downstream app installs, themes, extends, and
   contributes back. See `details/consumption.md`.

---

## Phase 3 — Build / Apply

Apply in this priority order (fix existing repos top-down; build new repos in the same order):

1. **Foundations.** Workspace + tooling + token layer + theming + catalog scaffold green in CI before any component.
2. **Token violations.** Replace every `#hex` / `rgb()` / `12px` / font-stack literal and every Tailwind arbitrary value (`bg-[#...]`) with a token class. (`check-tokens.py`)
3. **Layer violations.** Remove upward imports; move domain-named pieces into `domain/<module>/` or page-local; keep `tokens/` React-free. (`check-layers.py`)
4. **Genericize.** Turn product-named components (`TeamMembersTable`) into prop-driven generics (`Table` with `columns`/`rows`); strip API calls (inject data via props); replace `data.ts` with `mocks/*.fixtures.ts`. (Extraction: `details/extraction.md`)
5. **Catalog coverage.** Every exported component gets a sample page rendering all variants + states; fixtures never import the kit; no network in catalog. (`check-catalog.py`)
6. **Packaging.** Curate the barrel (named exports only), wire the `exports` map + peer deps + Tailwind preset; add a Changeset for every change. (`details/packaging.md`)
7. **Consumption fixes.** In consuming apps: import from the package root only, never branch on theme/brand, never punch through tokens with inline styles. (`check-consumption.py`)

---

## Phase 4 — Verify

1. Re-run the relevant `scripts/check-*.py` — no WARN findings remain.
2. `tokens/` contains zero React/JSX; every component reads color/space/type via token classes.
3. Toggling theme **and** brand in the catalog header restyles every page with no re-mount.
4. Every exported symbol in the barrel has a catalog page; every declared state is reachable via a control.
5. Lint proves down-only imports (lower layer cannot import upper); no deep imports of `@org/ui/src/*`.
6. `validateTheme()` passes for every shipped theme (all required token keys present).
7. A consuming app can install the package, apply the preset + `globals.css` + `<ThemeProvider>`, and render a themed component with its own data.
8. Report changes as `file:line - rule - fix`, plus a "moves" list (`from → to`) when files were relocated.

---

## Quick Reference

### Target Repo Layout

```
template/
├── apps/catalog/                 # sample app — renders every variant (Next.js or Vite)
│   ├── app|src/sample/<category>/<page>/   # catalog pages
│   └── src/mocks/                # fixtures (NEVER import the kit)
├── packages/ui/                  # the library
│   └── src/
│       ├── tokens/               # Layer 1 — pure TS, no React; themes/ subfolder
│       ├── components/
│       │   ├── atoms/ forms/                         # Layer 2
│       │   ├── feedback/ surfaces/ overlays/ data/ charts/   # Layer 3
│       │   ├── navigation/ layout/ auth/ marketing/ domain/  # Layer 4
│       │   └── templates/                            # Layer 5
│       ├── hooks/ utils/ types/ icons/
│       ├── styles/globals.css    # CSS-variable definitions
│       └── index.ts              # public barrel (the only contract)
├── docs/ .changeset/ .github/
├── pnpm-workspace.yaml  tsconfig.base.json  tailwind.config.ts
```

### The Five Layers

| Layer | Holds | May import | Domain names? |
| --- | --- | --- | --- |
| 1 Tokens | color/type/space/radii/shadow/motion/z | nothing (pure TS) | no |
| 2 Atoms | Button, Input, Badge, Avatar, Spinner | tokens | no |
| 3 Composites | Card, Modal, Table, Tabs, Menu, charts | atoms, composites | no |
| 4 Sections & Domain | page regions, `domain/<module>/` pieces | atoms, composites | **yes** |
| 5 Templates | Dashboard/List/Detail/Auth shells (slots only) | all below | no (layout only) |

### Token Categories Every Theme Must Define

color (brand / accent / neutral / semantic / surface / text) · typography (display/body/mono + size scale) · spacing · radii · shadows · motion · z-index · breakpoints. Missing any = build error via `validateTheme()`.

### Workflow A — Greenfield (build template first)

1. Scaffold monorepo + tooling (`details/monorepo-setup.md`).
2. Build token layer + 2 default themes + `ThemeProvider` + catalog scaffold.
3. Ship atoms → composites → sections → templates, each with a catalog page.
4. Publish the package; apps install it and wire data (`details/consumption.md`).

### Workflow B — Extraction (existing project → template)

1. Inventory existing UI; flag duplication, hardcoded styles, domain-named shared components.
2. Extract tokens from existing CSS first; replace literals with token classes.
3. Stand up `packages/ui`; migrate generic components by layer (atoms first).
4. Genericize: prop-drive bespoke components, strip API calls, fixtures replace `data.ts`.
5. Add a catalog page per migrated component.
6. Point the original project at the package — it becomes the first consumer.
7. Promote only what 2+ surfaces share; leave app-unique pieces local. (`details/extraction.md`)

### Decision Tables

| Question | Answer |
| --- | --- |
| Smallest UI primitive (button, badge, input)? | Layer 2 — `components/atoms/` |
| Composed of atoms, no domain copy? | Layer 3 — `components/<type>/` |
| Carries a product/feature term, reused by 2+ surfaces? | Layer 4 — `components/domain/<module>/` |
| Carries a product term, used by ONE surface only? | keep app-local, not in the template |
| Whole page shell (header + sidebar + main)? | Layer 5 — `components/templates/` |
| New look of an existing component? | a **variant prop**, not a new component |

---

## Common Mistakes to Avoid

| Anti-pattern | Correct approach |
| --- | --- |
| `#0a7` / `rgb()` / `12px` / `font-family` literal in a component | Token class (`bg-brand-500`, `p-3`, `text-body-md`) resolving to a CSS variable |
| `className="bg-[#0a7cff]"` arbitrary Tailwind value | Add/Use a token; never bake a literal into a class |
| `tokens/colors.ts` importing React or returning JSX | Tokens are pure `.ts` values; no React below Layer 2 |
| Atom importing a composite (upward import) | Imports go down only; lift shared logic to a hook/util |
| `TeamMembersTable.tsx` in the shared kit | Generic `Table` with `columns` + `rows` props |
| Component calling `fetch` / `useQuery` | Components take typed data via props; consumer fetches |
| `data.ts` / `types.ts` dumped inside `components/` | `mocks/<name>.fixtures.ts` for data; `<Name>.types.ts` co-located |
| Fixture importing `@org/ui` | Components depend on fixtures, never the reverse |
| Sample page that calls a real API | Use a fixture, or MSW for a network demo |
| Component branching on `theme === 'dark'` / `brand === 'x'` | Fix the **token**, not the component; brands are invisible to components |
| Prop like `themeOverride` / `customColor` | Add a variant or a token; never punch through the token layer |
| `import { Button } from '@org/ui/src/components/...'` | Import from the package root: `from '@org/ui'` |
| Forking template files into a consumer | Consume via the package; contribute missing pieces back |

---

## Quality Checklist

- [ ] Relevant `scripts/check-*.py` return no WARN findings.
- [ ] `packages/ui` + `apps/catalog` in one pnpm workspace; CI green (lint, typecheck, test, visual, a11y).
- [ ] `tokens/` is pure TS (no React); every token is emitted as a CSS variable.
- [ ] Two default themes ship; `validateTheme()` passes for each; brand override proven in the catalog.
- [ ] No `#hex` / `rgb()` / raw `px` / font-stack / `bg-[#...]` literal in any component source.
- [ ] Imports go down only; no deep imports of `@org/ui/src/*`; the barrel exports named symbols only.
- [ ] No product/brand name in any component file or token name.
- [ ] Every exported component has a catalog page rendering all variants, sizes, and states.
- [ ] Fixtures never import the kit; no catalog page calls a real backend.
- [ ] Consuming app uses the package root import, the Tailwind preset, `globals.css`, and `<ThemeProvider>`.
- [ ] Every change carries a Changeset; barrel/token removals are major bumps.

---

## Detail Index

| Topic | File |
| --- | --- |
| Greenfield repo + stack + tooling | `details/monorepo-setup.md` |
| Tokens & multi-brand theming | `details/tokens-and-theming.md` |
| The five component layers | `details/layers.md` |
| Sample-page catalog convention | `details/catalog.md` |
| Consuming the template in an app | `details/consumption.md` |
| Extracting a template from an existing project | `details/extraction.md` |
| Build, exports, versioning, publishing | `details/packaging.md` |

---

## Changelog

| Version | Date | Change |
| --- | --- | --- |
| 1.0.0 | 2026-06-04 | Initial release. Self-contained template build guide covering greenfield + extraction workflows, tokens/theming, 5-layer model, catalog convention, packaging, consumption, and five check scripts. |

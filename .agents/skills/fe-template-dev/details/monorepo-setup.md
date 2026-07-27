# Monorepo Setup (Greenfield)

> Stand up the template repo so lint, typecheck, build, sample app, and tests run in CI
> **before** any component exists. The library and the catalog live in one repo.

## 1. Workspace

```bash
mkdir template && cd template
pnpm init
```

`pnpm-workspace.yaml`:

```yaml
packages:
  - "packages/*"
  - "apps/*"
```

Create the two artifacts:

```
packages/ui/        # the library — exports all components
apps/catalog/       # the sample app — renders every variant
```

Minimum tool versions: Node ≥ 20 LTS, pnpm ≥ 9, TypeScript ≥ 5.4, React ≥ 18.3.

## 2. Stack (opinionated defaults)

| Concern | Choice | Note |
| --- | --- | --- |
| Language | TypeScript (strict) | type-safe component APIs are the point of a kit |
| Library framework | React 18+ | framework-agnostic React; no Next/Vite dependency in the library |
| Sample app | Next.js (App Router) **or** Vite + React Router | pick what most consumers use; the catalog doubles as a copy-paste reference |
| Library build | `tsup` | ESM + CJS + `.d.ts` from one config |
| Styling | Tailwind CSS v4 + CSS variables | tokens become CSS variables; classes reference them |
| Class composition | `clsx` + `tailwind-merge` | predictable className merging |
| Variant API | CVA (`class-variance-authority`) | typed `variant`/`size`/`tone` → className recipes |
| Primitives | Radix UI | accessible headless menus/dialogs/popovers/tabs |
| Icons | `lucide-react` + custom SVGs | single, consistent source |
| Tables / charts | TanStack Table (headless) / Recharts | styling stays ours |
| Unit tests | Vitest + React Testing Library | fast, ESM-friendly |
| Visual + a11y | Playwright snapshots + `axe-core` | the catalog is the snapshot/a11y target |
| Versioning | SemVer + Changesets | per-PR notes; auto changelog |

Explicitly **not** added: CSS-in-JS runtime (styled-components/Emotion), a second UI kit
(MUI/Mantine/Chakra), a routing layer in the library, or a global state container in the library.

## 3. Shared config at the root

- `tsconfig.base.json` — strict mode + path aliases (below); each package extends it.
- `tailwind.config.ts` — the shared preset (token aliases → CSS variables) used by both workspaces and re-exported for consumers.
- `eslint.config.mjs` — `@typescript-eslint`, `eslint-plugin-react`, `jsx-a11y`, `eslint-plugin-tailwindcss`, plus the import-direction rule (see `layers.md`).
- `prettier.config.mjs` — with `prettier-plugin-tailwindcss` for class ordering.

Path aliases (`tsconfig.base.json`) — replace `@org` with your npm scope:

```json
{
  "compilerOptions": {
    "paths": {
      "@org/ui": ["packages/ui/src/index.ts"],
      "@org/ui/*": ["packages/ui/src/*"]
    }
  }
}
```

The catalog and tests import via `@org/ui`, never via relative `../../packages/ui/...`.

## 4. `packages/ui` skeleton

```
packages/ui/
├── src/
│   ├── tokens/{colors,typography,spacing,radii,shadows,motion,zIndex,breakpoints}.ts
│   ├── tokens/themes/{default-light,default-dark}.ts
│   ├── tokens/{defineTheme.ts,index.ts}
│   ├── components/{atoms,forms,feedback,surfaces,overlays,navigation,layout,data,charts,auth,marketing,domain,templates}/
│   ├── hooks/  utils/  types/  icons/
│   ├── styles/globals.css
│   └── index.ts            # public barrel
├── tests/
├── package.json            # exports map; "sideEffects": false
├── tsconfig.json
└── tsup.config.ts
```

Each component owns a folder (see `layers.md`):
`components/atoms/Button/{Button.tsx, Button.types.ts, Button.variants.ts, Button.test.tsx, Button.fixtures.ts, README.md, index.ts}`.

## 5. `apps/catalog` skeleton

```
apps/catalog/
├── app|src/routes/
│   ├── layout.tsx          # ThemeProvider + ToastProvider + brand/theme switcher
│   ├── page.tsx            # /sample index, generated from a typed registry
│   └── sample/<category>/<page>/page.tsx
├── src/mocks/              # fixtures (NEVER import the kit)
├── src/shell/              # catalog-only nav, search, switchers
└── (next.config.mjs | vite.config.ts)
```

## 6. CI (GitHub Actions) — gates from day 0

`lint` → `typecheck (tsc --noEmit)` → `unit (vitest)` → `visual (playwright, placeholder ok early)` → `a11y (axe)` → `publish` (manual / on tag). A no-op PR must go green and `pnpm dev` must boot the catalog before Phase 1 of any component work.

## 7. Order of operations

Foundations before components: token layer + both default themes + `ThemeProvider` + catalog
`foundations/*` pages must exist and pass `axe` before the first atom. Then build by layer
(atoms → composites → sections → templates). See `../SKILL.md` Phase 3 and `tokens-and-theming.md`.

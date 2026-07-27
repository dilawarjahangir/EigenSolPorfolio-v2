# Packaging, Exports, Versioning & Publishing

> The library is the contract. Curate the public surface, build ESM+CJS+types, version with
> SemVer, and publish to a private registry. `@org/ui` is a placeholder for your scope.

## The barrel is the only public surface

`packages/ui/src/index.ts` re-exports everything stable:

```ts
export * from './tokens';
export * from './components/atoms';
export * from './components/forms';
export * from './components/feedback';
export * from './components/surfaces';
export * from './components/overlays';
export * from './components/navigation';
export * from './components/layout';
export * from './components/data';
export * from './components/charts';
export * from './components/auth';
export * from './components/marketing';
export * from './components/domain';
export * from './components/templates';
export * from './hooks';
export * from './utils';
export * from './types';
```

Rules:
- Anything not exported here is private. Breaking the barrel = major bump.
- Named exports only — avoid `export default` (noisy barrels/refactors).
- Consumers import from the root; deep imports (`@org/ui/src/*`) are forbidden (`check-consumption.py`).

## `package.json` (library)

```jsonc
{
  "name": "@org/ui",
  "version": "0.1.0",
  "type": "module",
  "sideEffects": false,                 // enables tree-shaking
  "exports": {
    ".":               { "types": "./dist/index.d.ts", "import": "./dist/index.mjs", "require": "./dist/index.cjs" },
    "./tokens":        { "types": "./dist/tokens/index.d.ts", "import": "./dist/tokens/index.mjs" },
    "./tailwind":      { "import": "./dist/tailwind/preset.mjs", "require": "./dist/tailwind/preset.cjs" },
    "./styles/globals.css": "./dist/styles/globals.css"
  },
  "files": ["dist"],
  "peerDependencies": { "react": "^18.3", "react-dom": "^18.3", "tailwindcss": "^4" },
  "scripts": { "build": "tsup", "test": "vitest run", "typecheck": "tsc --noEmit" }
}
```

The subpath exports (`./tokens`, `./tailwind`, `./styles/globals.css`) are the only sanctioned
deep entry points — they map to curated build artifacts, not source.

## Build with tsup

```ts
// packages/ui/tsup.config.ts
import { defineConfig } from 'tsup';
export default defineConfig({
  entry: ['src/index.ts', 'src/tokens/index.ts', 'src/tailwind/preset.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  treeshake: true,
  external: ['react', 'react-dom', 'tailwindcss'],
});
```

Ship `styles/globals.css` as a static asset (copy step or a CSS entry). Consumers import it once.

## Versioning (SemVer + Changesets)

| Change | Bump |
| --- | --- |
| New component / variant / token | minor |
| Bug fix, token value tuning | patch |
| Remove/rename a barrel export or a token name | **major** |
| Add a theme | patch or minor |

- Every PR adds a Changeset entry; the changelog is generated from them.
- Deprecate before removing: ship the replacement, mark the old one `@deprecated` + lint-warn,
  migrate internals, wait one minor cycle, remove in the next major.

## Distribution & CI

- Publish to a **private registry** (e.g. GitHub Packages). Consumers install via the registry.
- GitHub Actions pipeline: `lint → typecheck → unit (vitest) → visual (playwright) → a11y (axe) → publish (on tag)`.
- CI fails the PR if a new exported symbol has no catalog page (coverage gate).

## What is NOT published / NOT in the package

- App-specific domain logic, route guards, live-API wiring (these live in consumers).
- Brand visual specs / design files (referenced only as theme files).
- The sample app (`apps/catalog`) — it is the dev/docs surface, not shipped to consumers.

## Release checklist

- [ ] Barrel reviewed; only intended symbols are public; named exports only.
- [ ] `exports` map, `sideEffects: false`, and `peerDependencies` correct.
- [ ] `tsup` emits ESM + CJS + `.d.ts`; `tailwind` preset and `globals.css` are reachable subpaths.
- [ ] Every change has a Changeset; removals are bundled into a major.
- [ ] CI green: lint, typecheck, unit, visual, a11y, coverage gate.

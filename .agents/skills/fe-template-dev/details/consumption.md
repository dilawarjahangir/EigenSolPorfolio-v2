# Consuming the Template in an App

> The contract a downstream app follows. The first consumer is often the original project
> (in the extraction workflow). `@org/ui` is a placeholder — replace `@org` with your scope.

## Install

```bash
pnpm add @org/ui
```

Peer dependencies the app must also have:
- `react ^18.3`, `react-dom ^18.3`
- the app framework (e.g. `next ^14`) — only if used
- `tailwindcss ^4`

The package declares these as `peerDependencies`; the library has no runtime dependency on any
app framework.

## One-time setup (three wirings)

### 1. Tailwind preset

```ts
import { tailwindPreset } from '@org/ui/tailwind';

export default {
  presets: [tailwindPreset],
  content: ['./src/**/*.{ts,tsx}', './node_modules/@org/ui/dist/**/*.{js,mjs,cjs}'],
};
```

The preset wires color/spacing/radius/typography aliases to CSS variables and token-aware
utilities (`bg-surface`, `text-fg-default`, `text-display-1`).

### 2. Global stylesheet (once, in the root layout)

```ts
import '@org/ui/styles/globals.css';   // injects :root token variables + Tailwind base
```

### 3. ThemeProvider

```tsx
import { ThemeProvider, defaultLight, defaultDark } from '@org/ui';

export default function RootLayout({ children }) {
  return (
    <html lang="en"><body>
      <ThemeProvider themes={[defaultLight, defaultDark]} defaultTheme="default-light">
        {children}
      </ThemeProvider>
    </body></html>
  );
}
```

That is the full setup — no token files, component code, or Tailwind config copied from the template.

## Importing components

```tsx
import { Button, Card, DataTable, ModalShell, type ButtonProps } from '@org/ui';
```

- Always import from the package root. **Never** `@org/ui/src/...`.
- Components export their props + variant types so wrapper code stays typed.

## Composing with domain logic

The app owns data, routing, error boundaries, and stores. The template owns layout, interaction,
visuals, and a11y.

```tsx
'use client';
import { DataTable } from '@org/ui';
import { useCustomers } from '@/data/customers';

export function CustomersPage() {
  const { rows, isLoading, error } = useCustomers();
  return <DataTable columns={customerColumns} rows={rows ?? []}
    state={isLoading ? 'loading' : error ? 'error' : 'default'} />;
}
```

## Theming the app

```tsx
import { defineTheme, defaultLight } from '@org/ui';
import { hslRamp } from '@org/ui/tokens';

const projectLight = defineTheme({
  name: 'project-x-light', extends: defaultLight,
  tokens: { color: { brand: hslRamp('260 80% / 60%') }, radius: { md: '0.625rem' } },
});
```

- An app's brand theme must not invent new token names. If it needs one, upstream it.
- Own at most two brand themes (light + dark). More usually means it is a different app.

## Extending without forking

| Need | Right answer |
| --- | --- |
| Small visual tweak on a button | use existing variant/size props; else propose a new variant and contribute it back |
| Card with an app-specific footer | compose: `<Card><Card.Body/>…</Card>` + `<ProjectXFooter/>` (footer lives in the app) |
| A domain composite the kit lacks | generic → contribute to the template; app-specific → build locally in `src/components/` |
| A new icon | from the icon set → just import; org-wide custom → contribute to `icons/custom/`; app-only → keep local |
| Render a part differently | check the slot / sub-component API first; if missing, propose adding it |

Rule of thumb: **if two apps could plausibly use the same piece, it goes in the template.**

## Anti-patterns

- Forking template files into the consumer (always consume via the package).
- Deep imports (`@org/ui/src/...`).
- Inline `style` with hex/px to override a template component (breaks theming — use a variant/token).
- Copy-pasting catalog fixtures into production (fixtures are mock data).
- Wrapping every template component in a thin re-export.

## Contributing back & updating

- PR against the template with the missing variant/component/token + a catalog page demoing all states + a Changeset.
- Patch/minor updates are safe anytime; major updates only remove a public type/token and ship a migration note. A deprecation lint warning appears one cycle before any major removal.

## Day-1 summary

`pnpm add @org/ui` → add preset → import `globals.css` → wrap in `<ThemeProvider>` → import
from `@org/ui` → contribute back instead of forking.

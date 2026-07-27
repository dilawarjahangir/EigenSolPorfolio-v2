# Tokens & Multi-Brand Theming

> The token layer is built **first** and is the reason one template can dress many apps.
> Tokens are semantic names; a theme binds values to them; a brand overrides values only.

## Mental Model

- **Token** = semantic name (`color.bg.subtle`, `radius.md`, `font.body.lg`).
- **Theme** = a set of values bound to those names.
- **Brand** = a theme that overrides existing token values (never invents new names).

A component reads tokens via Tailwind classes; it never knows which app or brand it renders for.

## Implementation: CSS variables

- Every token is a CSS variable at `:root` (default light) and `:root[data-theme="dark"]` (dark).
- Tailwind classes resolve to `var(--token)` via the shared preset.
- Switching theme = one attribute on `<html>` (`data-theme="dark"`). Switching brand = `data-brand="acme"`. No re-render, no JS state library.

```css
:root {
  --color-brand-500: 222 84% 56%;     /* HSL channels */
  --color-bg-subtle:  220 14% 98%;
  --radius-md: 0.5rem;
  --font-display: 'Inter Variable', system-ui, sans-serif;
}
:root[data-theme="dark"]            { --color-bg-subtle: 220 14% 12%; }
:root[data-brand="acme"]            { --color-brand-500: 14 92% 60%; --radius-md: 0.75rem; }
:root[data-brand="acme"][data-theme="dark"] { --color-bg-subtle: 14 30% 8%; }
```

## Token categories every theme MUST define

Missing any of these is a build error (enforced by `validateTheme()`):

- **color · brand**: `brand-50`…`brand-900`, `brand-foreground`.
- **color · accent**: `accent-50`…`accent-900`, `accent-foreground` (optional 2nd hue).
- **color · neutral**: `neutral-0`…`neutral-1000`.
- **color · semantic**: `success` / `warning` / `danger` / `info`, each with `-fg`, `-bg`, `-border`.
- **color · surface**: `bg-app`, `bg-surface`, `bg-surface-muted`, `bg-overlay`, `border-default`, `border-subtle`, `border-strong`.
- **color · text**: `fg-default`, `fg-muted`, `fg-subtle`, `fg-disabled`, `fg-on-brand`.
- **typography**: `font-display`, `font-body`, `font-mono` + size scale (`xs/sm/md/lg/xl/2xl/display-1/display-2`).
- **spacing**: `0`→`24` (4-pt scale).
- **radii**: `none/sm/md/lg/full`. **shadows**: `0`→`4` + `inner`.
- **motion**: `fast/base/slow` + `ease-standard/ease-entrance/ease-exit`. **z-index**: `base/dropdown/sticky/overlay/modal/toast`.

## Theme file shape

```ts
// packages/ui/src/tokens/themes/default-light.ts
import { defineTheme } from '../defineTheme';

export const defaultLight = defineTheme({
  name: 'default-light',
  extends: null,
  tokens: {
    color: { brand: hslRamp('220 84% / 56%'), accent: hslRamp('170 70% / 45%'),
             neutral: hslRamp('220 14% / 50%'), semantic: {/*…*/}, surface: {/*…*/}, text: {/*…*/} },
    radius: { none:'0', sm:'0.25rem', md:'0.5rem', lg:'1rem', full:'9999px' },
    shadow: {/*…*/}, motion: {/*…*/}, z: {/*…*/}, typography: {/*…*/}, spacing: {/*…*/},
  },
});
```

`defineTheme()` (1) validates all required keys are present, (2) produces a `.css` string of
variable definitions, (3) produces a typed token object readable in JS when unavoidable.

## Brand themes — extend, never invent

```ts
import { defineTheme } from '../defineTheme';
import { defaultLight } from './default-light';

export const acmeLight = defineTheme({
  name: 'acme-light',
  extends: defaultLight,
  tokens: {
    color: { brand: hslRamp('14 92% / 60%') },
    radius: { md: '0.75rem' },
    typography: { 'font-display': "'Acme Display', serif" },
  },
});
```

Rules:
- A brand theme overrides values for **existing** token names only.
- Ship both light and dark variants if the brand wants both; else dark falls back to default dark.
- Brands can live inside the template (org-owned) or in a downstream app (which imports `defineTheme`).

## ThemeProvider

```tsx
<ThemeProvider themes={[defaultLight, defaultDark, acmeLight, acmeDark]} defaultTheme="default-light">
  {children}
</ThemeProvider>
```

It reads `prefers-color-scheme` + persisted `localStorage` prefs, sets `data-theme`/`data-brand`
on the root, renders all theme `<style>` blocks once, and switches by mutating attributes only.

## Per-component rules

- Colors via classes: `bg-surface`, `text-fg-default`, `border-border-default`. Never `bg-[#fff]`.
- Spacing via classes: `p-3`, `gap-2`. Sizes via class tokens: `text-body-md`, `text-display-1`.
- A component must **not** branch on theme/brand (`if (theme === 'dark')`). If behaviour differs by theme, fix the token, not the component.
- A component **may** read a CSS variable in JS only for canvas/chart fills: `getComputedStyle(el).getPropertyValue('--color-brand-500')`.

## Adding a brand

1. `tokens/themes/<brand>-light.ts` (+ `<brand>-dark.ts`). 2. `validateTheme()` passes.
3. Register in the catalog brand-switcher. 4. Visual-regression captures the brand × theme matrix. 5. Minor release.

If a brand needs a token the template lacks: if it is cross-cutting, add it to the token system
(minor, update both default themes); if it is brand-specific only, it does not belong in the
template — the consumer applies it in its own app layer.

## Anti-patterns to reject

- A component importing from `tokens/themes/...` (read tokens via classes, not theme objects).
- A prop named `themeOverride` / `customColor` (use a variant or a token).
- Hard-coded brand strings in logic (`if (brand === 'acme')`).
- A theme file that defines **new** token keys (themes set values; the token system defines keys).

## Versioning

Add token = minor · rename/remove token = major · add theme = patch/minor · change a value = patch.
To replace a token: ship both, `@deprecated` + lint-warn the old one, migrate internals, wait one
minor cycle, remove in the next major.

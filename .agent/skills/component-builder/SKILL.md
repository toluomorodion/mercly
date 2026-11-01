# Component Builder Skill

Load this skill whenever you are creating or modifying a React component in SellSnap. It tells you where the component goes, how it should be structured, and how to wire it up to the design system without reinventing anything.

## Before You Start

Read `.agent/rules/design-system.md` and `.agent/rules/code-style.md` first. Components that do not follow the design system get rejected at review. This skill assumes you already know the tokens, the spacing scale, and the component primitives.

Then ask: does this component already exist? Search `components/` before adding a new one. Two slightly different `Button` components is how codebases rot.

## Where Components Live

```
components/
├── ui/                  primitives: Button, Input, Card, Badge, Avatar, etc.
├── product/             anything specific to the product domain (ProductCard, ProductImage, PriceTag)
├── dashboard/           anything that only exists inside the seller dashboard (OrdersTable, ProductList)
└── shared/              composites used across more than one domain (EmptyState, PageHeader)
```

If a component is used exactly once and it is complex, it can live next to the page that uses it in `app/.../_components/`. Promote it to `components/` when a second caller shows up.

## Component File Template

```tsx
// components/<folder>/<ComponentName>.tsx

import styles from './<ComponentName>.module.css';

type <ComponentName>Props = {
  // Props go here. Required props first, optional after.
  children?: React.ReactNode;
  className?: string;
};

export function <ComponentName>({ children, className }: <ComponentName>Props) {
  return (
    <div className={`${styles.root} ${className ?? ''}`}>
      {children}
    </div>
  );
}
```

```css
/* components/<folder>/<ComponentName>.module.css */

.root {
  /* Base styles using design tokens only. */
}
```

Notes:
- Named export, not default export. Default exports make renaming harder and break auto-imports.
- `className` prop is always accepted on components that render a single root element, so callers can add layout context without forking the component.
- Props type goes above the component, named `<ComponentName>Props`.
- Required props come before optional ones in the type definition.
- The `.module.css` file lives alongside the `.tsx` file with the same base name.

## Server vs. Client Components

Default to server components. A component becomes a client component only when it needs one of these:
- React state (`useState`, `useReducer`)
- Effects (`useEffect`, `useLayoutEffect`)
- Browser-only APIs (`window`, `document`, `localStorage`)
- Event handlers that are more than a simple link (`onClick`, `onChange`)
- Context consumption for interactivity

If you add `"use client"`, put it on the first line of the file. Do not add it defensively.

Keep the client boundary as low in the tree as possible. A page that is mostly static but has one interactive button should not be a client component; the button should be.

## Styling

CSS Modules only. Every component gets a `.module.css` file alongside its `.tsx` file. No Tailwind. No inline `style={{}}` props except for truly dynamic values that cannot be expressed in CSS (e.g., a progress bar width driven by a number, or an image aspect ratio from user input).

### Colors — use CSS custom properties

Always reference tokens from `tokens/tokens.css`. Never write hex values or `rgb()`:

| Token | Use for |
|---|---|
| `var(--color-primary)` | Primary CTAs, active states, links |
| `var(--color-on-primary)` | Text/icons on primary backgrounds |
| `var(--color-surface)` | Card backgrounds, page surfaces |
| `var(--color-on-surface)` | Primary body text |
| `var(--color-on-surface-variant)` | Secondary text, muted labels |
| `var(--color-error)` | Error indicators, destructive actions |
| `var(--color-on-error)` | Text on error backgrounds |
| `var(--color-outline)` | Borders, dividers, focus rings |
| `var(--color-outline-variant)` | Subtle borders, inactive outlines |

Dark mode is handled automatically by the token system — do not write your own `prefers-color-scheme` or `[data-theme="dark"]` overrides.

### Typography — apply individual properties

Typography tokens are not shorthands. Apply each property individually:

```css
.productName {
  font-family: var(--typography-headline-headline-small-font-family);
  font-size: var(--typography-headline-headline-small-font-size);
  font-weight: var(--typography-headline-headline-small-font-weight);
  line-height: var(--typography-headline-headline-small-line-height);
  letter-spacing: var(--typography-headline-headline-small-letter-spacing);
}
```

If you find yourself repeating this pattern across multiple selectors, extract a shared CSS `composes` block or a module class.

### Spacing — use the scale

Use multiples of 4px only. No arbitrary values:

| Value | Semantic use |
|---|---|
| `4px` | Tight gaps (icon + text, badge padding) |
| `8px` | Component internal padding, small element gaps |
| `12px` | Form field gaps, card content spacing |
| `16px` | Section padding, standard element gaps |
| `24px` | Card padding, page-level section spacing |
| `32px` | Major section breaks |
| `48px` | Page-level margins |
| `64px` | Large page margins |

### Border radius

- Small elements (badges, tags, chips): `4px`
- Buttons and inputs: `8px`
- Cards and modals: `12px`

### Animations

Keep transitions subtle. Respect `prefers-reduced-motion`:

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.root {
  transition: background-color 200ms ease-out;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Variants

For components with variants (Button, Badge), use CSS Modules `composes` with modifier classes. Define a base class and compose variant-specific overrides:

```css
/* Button.module.css */

.base {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-family: var(--typography-label-label-large-font-family);
  font-size: var(--typography-label-label-large-font-size);
  font-weight: var(--typography-label-label-large-font-weight);
  line-height: var(--typography-label-label-large-line-height);
  transition: background-color 100ms ease-out, transform 100ms ease-out;
  cursor: pointer;
  border: none;
}

.base:focus-visible {
  outline: 2px solid var(--color-outline);
  outline-offset: 2px;
}

.base:disabled {
  opacity: 0.5;
  pointer-events: none;
}

.primary {
  composes: base;
  background-color: var(--color-primary);
  color: var(--color-on-primary);
}

.primary:hover {
  filter: brightness(1.05);
}

.secondary {
  composes: base;
  background-color: var(--color-surface);
  color: var(--color-on-surface);
  border: 1px solid var(--color-outline);
}

.secondary:hover {
  background-color: var(--color-surface-container-lowest);
}

.danger {
  composes: base;
  background-color: var(--color-error);
  color: var(--color-on-error);
}

.sizeSm {
  padding: 4px 12px;
  min-height: 44px;
}

.sizeMd {
  padding: 8px 16px;
  min-height: 48px;
}

.sizeLg {
  padding: 12px 24px;
  min-height: 56px;
}
```

```tsx
// Button.tsx

import styles from './Button.module.css';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
};

const variantMap = {
  primary: styles.primary,
  secondary: styles.secondary,
  danger: styles.danger,
} as const;

const sizeMap = {
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
} as const;

export function Button({ variant = 'primary', size = 'md', className, ...props }: ButtonProps) {
  return (
    <button
      className={`${variantMap[variant]} ${sizeMap[size]} ${className ?? ''}`}
      {...props}
    />
  );
}
```

If a variant system gets complex, consider a small typed map in TypeScript (as shown above) rather than a long `if/else` chain in JSX.

## Accessibility

Every interactive element needs a keyboard-reachable focus state. Use `:focus-visible` with `var(--color-outline)`:

```css
:focus-visible {
  outline: 2px solid var(--color-outline);
  outline-offset: 2px;
}
```

Buttons without visible text need `aria-label`. Icon-only buttons are the most common offender. Do not let them ship without a label.

Form inputs need associated labels via `htmlFor`/`id`. Error messages are linked via `aria-describedby`.

Images need `alt`. Decorative images use `alt=""`. Do not omit the attribute.

Touch targets: every interactive element must be at least 44px × 44px. If the visual element is smaller, use padding or a transparent wrapper to meet the minimum.

Contrast: the MD3 token system is designed to maintain WCAG 2.1 AA ratios when used correctly. Always pair `--color-on-*` tokens with their matching surface token (e.g., `--color-on-primary` on `--color-primary`).

## Props to Avoid

- Do not expose raw color props (`color="red"`). Use variants.
- Do not expose raw size values in pixels. Use the size variants.
- Do not accept arbitrary inline styles via a `style` prop unless there is a specific reason (like a dynamic value that cannot be expressed in CSS Modules).
- Do not expose a `theme` or `dark` prop — dark mode is handled automatically by the token system.

## Testing a New Component

If the component is a primitive (lives in `ui/`), verify it manually in the context where it will be used. Check:
- Default appearance
- Every variant
- Every size
- Disabled state (if applicable)
- Focus state (tab into it)
- Hover state
- On mobile viewport (Chrome DevTools at 360px wide)

A dev-only route (`app/_dev/page.tsx`) can be set up as a component showcase when `NODE_ENV === 'development'`, but it is not yet implemented. Until then, review primitives on the pages that consume them.

Domain components (product, dashboard) can be reviewed in place on the relevant page.

## Mobile-First

SellSnap users are primarily on mobile in Nigeria, often on slower networks. Every component must be built mobile-first:

- Default styles target mobile (small screens).
- Use `@media (min-width: 768px)` to layer in tablet/desktop styles.
- The public product page (`/p/[slug]`) must be fully functional on a 375px viewport.
- Images should use `next/image` with responsive sizes to avoid loading full-resolution images on mobile.

## Common Mistakes

- Creating a new primitive when an existing one would work with a new variant. Extend, do not duplicate.
- Forgetting `className` prop on a component that might need to be laid out differently in different places.
- Making a component a client component because it was easier, when a server component would have worked.
- Using arbitrary pixel values instead of the spacing scale.
- Hardcoding colors instead of using design token CSS custom properties.
- Adding complex logic inside the JSX. Extract to a named constant or helper above the return.
- Writing your own dark-mode overrides — the token system handles this automatically.
- Forgetting `:focus-visible` styles on interactive elements.

---
trigger: always_on
---

# Rule: Design System

## Token Files Are the Source of Truth

The project has two token files. **The agent must never modify them:**

- `tokens/tokens.css` — CSS custom properties for colors and typography. The source of truth.
- `tokens/color-tokens.json` — raw JSON token definitions (used to generate `tokens.css`).

The CSS file is auto-generated from JSON. If a token needs to change, edit the JSON and regenerate — do not hand-edit the CSS.

## Mandatory: Use CSS Variables, Never Raw Values

Never write hardcoded color or typography values. Every style must reference a token variable.

**Wrong:**
```css
color: #1a1a1a;
font-size: 16px;
background: #f5f5f5;
```

**Correct:**
```css
color: var(--color-on-surface);
font-size: var(--typography-body-body-large-font-size);
background: var(--color-surface);
```

Before writing any style value, check `tokens/tokens.css`. If a variable exists for what you need, use it. If it does not exist, ask before inventing a new value.

## Color System

The color tokens follow Material Design 3 color roles. Each role has a surface color and a "on-" color for content drawn on top of it.

### When to use each color role

| Variable | Use for |
|---|---|
| `--color-primary` | Primary CTAs, active states, links, key interactive elements |
| `--color-on-primary` | Text/icons on primary-colored backgrounds |
| `--color-primary-container` | Subtle emphasis, highlighted sections that need to stand out |
| `--color-on-primary-container` | Text/icons on primary container backgrounds |
| `--color-secondary` | Secondary actions, less prominent interactive elements |
| `--color-on-secondary` | Text/icons on secondary backgrounds |
| `--color-secondary-container` | Chips, selected items, secondary emphasis |
| `--color-on-secondary-container` | Text/icons on secondary container backgrounds |
| `--color-surface` | Page backgrounds, card backgrounds, most container surfaces |
| `--color-on-surface` | Primary text color on surfaces |
| `--color-surface-variant` | Subtle backgrounds, dividers, inactive sections |
| `--color-on-surface-variant` | Secondary text, placeholder text, muted labels |
| `--color-background` | Root page background (behind surface layers) |
| `--color-on-background` | Text on the root background |
| `--color-error` | Error icons, destructive action indicators |
| `--color-on-error` | Text/icons on error-colored backgrounds |
| `--color-error-container` | Error message banners, validation error backgrounds |
| `--color-on-error-container` | Text on error container backgrounds |
| `--color-outline` | Borders, dividers, input field outlines |
| `--color-outline-variant` | Subtle borders, inactive outlines |
| `--color-inverse-surface` | Surfaces that need to invert (e.g. selected items, hover states) |
| `--color-inverse-on-surface` | Text on inverse surfaces |
| `--color-inverse-primary` | Primary color inverted for contrast |
| `--color-surface-container-lowest` through `--color-surface-container-highest` | Elevation layers — use the appropriate level for depth (cards, dialogs, drawers) |

### Dark Mode

Dark mode is handled automatically. The token file defines:

- `[data-theme="dark"]` — triggered when the user explicitly sets dark mode
- `@media (prefers-color-scheme: dark)` — system-level preference

Do not write your own dark-mode overrides. Use the token variables and they will adapt automatically.

## Typography

Typography tokens follow the Material Design 3 type scale. Each level includes font-size, font-weight, line-height, letter-spacing, and font-family. The variable names are verbose and redundant (e.g., `--typography-body-body-large-font-size`). Always use the full variable name.

### Typography mapping for SellSnap

| Token | Use for |
|---|---|
| `--typography-display-display-large-*` | Hero sections, empty-state illustrations (rarely used) |
| `--typography-headline-headline-large-*` | Page titles, major section headers |
| `--typography-headline-headline-medium-*` | Dashboard headings, feature titles |
| `--typography-headline-headline-small-*` | Product name on the public product page |
| `--typography-title-title-large-*` | Card titles, modal titles |
| `--typography-title-title-medium-*` | Section subheadings, form field group labels |
| `--typography-title-title-small-*` | Small section labels |
| `--typography-body-body-large-*` | Primary body text, product descriptions |
| `--typography-body-body-medium-*` | Secondary text, order details, table content |
| `--typography-body-body-small-*` | Captions, timestamps, helper text |
| `--typography-label-label-large-*` | Button text, navigation labels, primary interactive text |
| `--typography-label-label-medium-*` | Tags, badges, chip text |
| `--typography-label-label-small-*` | Micro labels, form field hints |

### Composing typography tokens

A typography variable is a set of individual properties, not a shorthand. Apply them individually:

```css
.productName {
  font-family: var(--typography-headline-headline-small-font-family);
  font-size: var(--typography-headline-headline-small-font-size);
  font-weight: var(--typography-headline-headline-small-font-weight);
  line-height: var(--typography-headline-headline-small-line-height);
  letter-spacing: var(--typography-headline-headline-small-letter-spacing);
}
```

If you find yourself repeating this pattern, consider a CSS `@mixin` approach or a shared module class.

## Spacing Scale

Use multiples of 4px for all spacing (margin, padding, gap). No arbitrary values.

Recommended scale: `4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`, `64px`

Spacing is not yet represented as CSS custom properties in `tokens/tokens.css`. Until it is, use the raw pixel values listed above. If spacing tokens are added to the token file in the future, update all components to use them.

**Semantic spacing guide:**
- `4px` — tight gaps between related inline elements (icon + text, badge internal padding)
- `8px` — component internal padding, gaps between small elements
- `12px` — form field gaps, card content spacing
- `16px` — section padding, standard gap between elements
- `24px` — card padding, page-level section spacing
- `32px` — major section breaks, between content blocks
- `48px` — page-level margins, hero section spacing
- `64px` — large page margins, between major page sections

## Animations and Transitions

There are no animation or transition tokens in the token file yet. Use these conventions:

**Timing:**
- `100ms` — micro-interactions (button hover, icon state changes)
- `200ms` — UI transitions (dropdown open, tooltip show)
- `300ms` — layout transitions (modal open, slide-in panels)

**Easing:**
- `ease-out` — UI elements entering the screen
- `ease-in` — UI elements leaving the screen
- `ease-in-out` — state toggles (accordion expand/collapse)

**Pattern:**
```css
.button {
  transition: background-color 200ms ease-out, transform 100ms ease-out;
}
```

Keep animations subtle and purposeful. Avoid spinning loaders, bouncing animations, or anything that could cause motion sickness. Respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Accessibility

**Contrast ratios:** All text must meet WCAG 2.1 AA minimum contrast ratios:
- Normal text (under 18px / 14px bold): **4.5:1** minimum
- Large text (18px+ / 14px bold+): **3:1** minimum

The MD3 color roles in `tokens/tokens.css` are designed to maintain sufficient contrast when used correctly:
- `--color-on-surface` on `--color-surface` — always safe for body text
- `--color-on-primary` on `--color-primary` — always safe for CTA text
- `--color-on-surface-variant` on `--color-surface` — safe for secondary text, avoid for small or thin text

**Avoid these combinations:**
- `--color-outline-variant` as text color — too light for readability
- `--color-surface-variant` text on `--color-surface` — insufficient contrast

**Touch targets:** Every interactive element must be at least 44px tall and 44px wide. If the visual element is smaller, use padding or a transparent wrapper to meet the minimum.

**Focus states:** Never use `outline: none` without providing an alternative focus indicator. Use `--color-outline` or `--color-primary` for focus rings.

## Border Radius

Consistent corner rounding. Use these values only:

- Small elements (badges, tags, chips): `4px`
- Buttons and inputs: `8px`
- Cards and modals: `12px`

## Styling Method

- All component styles use CSS Modules (`.module.css` files).
- No inline `style={{}}` props except for truly dynamic values that cannot be expressed in CSS (e.g., a progress bar width driven by a number, or an image aspect ratio from user input).
- No Tailwind. No styled-components. CSS Modules only.

## Mobile-First

SellSnap users are primarily on mobile in Nigeria, often on slower networks. Every component must be built mobile-first:

- Default styles target mobile (small screens).
- Use `@media (min-width: 768px)` to layer in tablet/desktop styles.
- The public product page (`/p/[slug]`) must be fully functional on a 375px viewport.
- Images should use `next/image` with responsive sizes to avoid loading full-resolution images on mobile.

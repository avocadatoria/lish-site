# Strapi Admin Theme Tokens

Override these in `src/admin/app.js` via the `config.theme` object:

```js
const config = {
  theme: {
    light: {
      colors: { primary600: '#your-color' },
    },
    dark: {
      colors: { primary600: '#your-color' },
    },
  },
};
```

For custom CSS beyond tokens, use `src/admin/strapi.scss` (imported via `bootstrap()` in `app.js`).

---

## Colors — Light Theme

### Primary
| Token | Default | Usage |
|-------|---------|-------|
| `primary100` | `#f0f0ff` | Light primary backgrounds |
| `primary200` | `#d9d8ff` | Primary hover/active backgrounds |
| `primary500` | `#7b79ff` | Secondary primary elements |
| `primary600` | `#4945ff` | Main brand color (buttons, links, active states) |
| `primary700` | `#271fe0` | Dark primary (pressed states) |

### Secondary
| Token | Default | Usage |
|-------|---------|-------|
| `secondary100` | `#eaf5ff` | Light secondary backgrounds |
| `secondary200` | `#b8e1ff` | Secondary hover/active |
| `secondary500` | `#66b7f1` | Secondary elements |
| `secondary600` | `#0c75af` | Main secondary color |
| `secondary700` | `#006096` | Dark secondary |

### Danger
| Token | Default | Usage |
|-------|---------|-------|
| `danger100` | `#fcecea` | Error backgrounds |
| `danger200` | `#f5c0b8` | Error hover |
| `danger500` | `#ee5e52` | Error accents |
| `danger600` | `#d02b20` | Error text/icons |
| `danger700` | `#b72b1a` | Dark error |

### Success
| Token | Default | Usage |
|-------|---------|-------|
| `success100` | `#eafbe7` | Success backgrounds |
| `success200` | `#c6f0c2` | Success hover |
| `success500` | `#5cb176` | Success accents |
| `success600` | `#328048` | Success text/icons |
| `success700` | `#2f6846` | Dark success |

### Warning
| Token | Default | Usage |
|-------|---------|-------|
| `warning100` | `#fdf4dc` | Warning backgrounds |
| `warning200` | `#fae7b9` | Warning hover |
| `warning500` | `#f29d41` | Warning accents |
| `warning600` | `#d9822f` | Warning text/icons |
| `warning700` | `#be5d01` | Dark warning |

### Alternative
| Token | Default | Usage |
|-------|---------|-------|
| `alternative100` | `#f6ecfc` | Alternative backgrounds |
| `alternative200` | `#e0c1f4` | Alternative hover |
| `alternative500` | `#ac73e6` | Alternative accents |
| `alternative600` | `#9736e8` | Main alternative |
| `alternative700` | `#8312d1` | Dark alternative |

### Neutral
| Token | Default | Usage |
|-------|---------|-------|
| `neutral0` | `#ffffff` | White / page background |
| `neutral100` | `#f6f6f9` | Light gray backgrounds |
| `neutral150` | `#eaeaef` | Borders, dividers |
| `neutral200` | `#dcdce4` | Heavier borders |
| `neutral300` | `#c0c0cf` | Disabled borders |
| `neutral400` | `#a5a5ba` | Placeholder text |
| `neutral500` | `#8e8ea9` | Secondary text |
| `neutral600` | `#666687` | Body text |
| `neutral700` | `#4a4a6a` | Headings |
| `neutral800` | `#32324d` | Dark text / sidebar |
| `neutral900` | `#212134` | Darkest text |
| `neutral1000` | `#181826` | Near-black |

### Button
| Token | Default | Usage |
|-------|---------|-------|
| `buttonNeutral0` | `#ffffff` | Button text on primary |
| `buttonPrimary500` | `#7b79ff` | Button secondary state |
| `buttonPrimary600` | `#4945ff` | Default button background |

---

## Colors — Dark Theme

Same token names, inverted values:

| Token | Value | | Token | Value |
|-------|-------|-|-------|-------|
| `primary100` | `#181826` | | `neutral0` | `#212134` |
| `primary200` | `#4a4a6a` | | `neutral100` | `#181826` |
| `primary500` | `#4945ff` | | `neutral150` | `#32324d` |
| `primary600` | `#7b79ff` | | `neutral200` | `#4a4a6a` |
| `primary700` | `#7b79ff` | | `neutral300` | `#666687` |
| `secondary100` | `#181826` | | `neutral400` | `#a5a5ba` |
| `secondary200` | `#4a4a6a` | | `neutral500` | `#c0c0cf` |
| `secondary500` | `#66b7f1` | | `neutral600` | `#a5a5ba` |
| `secondary600` | `#66b7f1` | | `neutral700` | `#eaeaef` |
| `secondary700` | `#b8e1ff` | | `neutral800` | `#ffffff` |
| `danger100` | `#181826` | | `neutral900` | `#ffffff` |
| `danger200` | `#4a4a6a` | | `neutral1000` | `#ffffff` |
| `danger500` | `#ee5e52` | | `alternative100` | `#181826` |
| `danger600` | `#ee5e52` | | `alternative200` | `#4a4a6a` |
| `danger700` | `#ee5e52` | | `alternative500` | `#ac73e6` |
| `success100` | `#181826` | | `alternative600` | `#ac73e6` |
| `success200` | `#4a4a6a` | | `alternative700` | `#e0c1f4` |
| `success500` | `#5cb176` | | `warning100` | `#181826` |
| `success600` | `#5cb176` | | `warning200` | `#4a4a6a` |
| `success700` | `#c6f0c2` | | `warning500` | `#f29d41` |
| `buttonNeutral0` | `#ffffff` | | `warning600` | `#f29d41` |
| `buttonPrimary500` | `#7b79ff` | | `warning700` | `#fae7b9` |
| `buttonPrimary600` | `#4945ff` | | | |

---

## Shadows

| Token | Default | Usage |
|-------|---------|-------|
| `filterShadow` | `0px 1px 4px rgba(33, 33, 52, 0.1)` | Card/filter shadows |
| `focus` | `inset 2px 0px 0px rgb(39, 31, 224), inset 0px 2px 0px rgb(39, 31, 224), inset -2px 0px 0px rgb(39, 31, 224), inset 0px -2px 0px rgb(39, 31, 224)` | Focus ring |
| `focusShadow` | `0px 0px 6px rgba(76, 191, 255, 0.75)` | Outer focus glow |
| `popupShadow` | `0px 2px 15px rgba(33, 33, 52, 0.1)` | Dropdown/popup shadows |
| `tableShadow` | `0px 1px 4px rgba(33, 33, 52, 0.1)` | Table shadows |

---

## Spacing

12-step scale, accessed as `spaces[0]` through `spaces[11]`:

| Index | Default |
|-------|---------|
| 0 | `0px` |
| 1 | `4px` |
| 2 | `8px` |
| 3 | `12px` |
| 4 | `16px` |
| 5 | `20px` |
| 6 | `24px` |
| 7 | `32px` |
| 8 | `40px` |
| 9 | `48px` |
| 10 | `56px` |
| 11 | `64px` |

---

## Typography

### Font Sizes
8-step scale:

| Index | Default |
|-------|---------|
| 0 | `1.1rem` (11px) |
| 1 | `1.2rem` (12px) |
| 2 | `1.4rem` (14px) |
| 3 | `1.6rem` (16px) |
| 4 | `1.8rem` (18px) |
| 5 | `2.0rem` (20px) |
| 6 | `2.4rem` (24px) |
| 7 | `3.2rem` (32px) |

Note: Strapi 5 uses `62.5%` base font-size, so `1rem = 10px`.

### Font Weights
| Token | Default |
|-------|---------|
| `regular` | `400` |
| `semiBold` | `500` |
| `bold` | `600` |

### Line Heights
7 values: `1.14, 1.22, 1.25, 1.33, 1.43, 1.45, 1.5`

---

## Border Radius

| Token | Default |
|-------|---------|
| `borderRadius` | `4px` |

---

## Breakpoints

| Token | Default |
|-------|---------|
| `initial` | `0px` |
| `small` | `520px` |
| `medium` | `768px` |
| `large` | `1080px` |

---

## Z-Index

| Token | Default |
|-------|---------|
| `navigation` | `100` |
| `overlay` | `300` |
| `modal` | `310` |
| `dialog` | `320` |
| `popover` | `500` |
| `notification` | `700` |
| `tooltip` | `1000` |

---

## Sizes

### Accordions
| Token | Default |
|-------|---------|
| `S` | `4.8rem` |
| `M` | `8.8rem` |

### Buttons (responsive)
| Token | Initial | Medium breakpoint |
|-------|---------|-------------------|
| `S` | `4rem` | `3.2rem` |
| `M` | `4.4rem` | `3.6rem` |
| `L` | `4.8rem` | `4rem` |

---

## Sources

- [Admin panel customization docs](https://docs.strapi.io/cms/admin-panel-customization)
- [Light colors source](https://github.com/strapi/design-system/blob/main/packages/design-system/src/themes/lightTheme/light-colors.ts)
- [Dark colors source](https://github.com/strapi/design-system/blob/main/packages/design-system/src/themes/darkTheme/dark-colors.ts)
- [Common theme source](https://github.com/strapi/design-system/blob/main/packages/design-system/src/themes/common-theme.ts)
- [Shadows source](https://github.com/strapi/design-system/blob/main/packages/design-system/src/themes/lightTheme/light-shadows.ts)
- [Sizes source](https://github.com/strapi/design-system/blob/main/packages/design-system/src/themes/sizes.ts)

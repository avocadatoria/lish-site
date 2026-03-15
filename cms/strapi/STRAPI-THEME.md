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

**Merge behavior:** Objects are deep-merged (you only specify what you're changing). Arrays replace entirely (provide all values).

For custom CSS beyond tokens, use `src/admin/strapi.scss` (imported via `bootstrap()` in `app.js`).

---

## Colors

| Token | Light | Dark |
|-------|-------|------|
| **Primary** | | |
| `primary100` | `#f0f0ff` | `#181826` |
| `primary200` | `#d9d8ff` | `#4a4a6a` |
| `primary500` | `#7b79ff` | `#4945ff` |
| `primary600` | `#4945ff` | `#7b79ff` |
| `primary700` | `#271fe0` | `#7b79ff` |
| **Secondary** | | |
| `secondary100` | `#eaf5ff` | `#181826` |
| `secondary200` | `#b8e1ff` | `#4a4a6a` |
| `secondary500` | `#66b7f1` | `#66b7f1` |
| `secondary600` | `#0c75af` | `#66b7f1` |
| `secondary700` | `#006096` | `#b8e1ff` |
| **Danger** | | |
| `danger100` | `#fcecea` | `#181826` |
| `danger200` | `#f5c0b8` | `#4a4a6a` |
| `danger500` | `#ee5e52` | `#ee5e52` |
| `danger600` | `#d02b20` | `#ee5e52` |
| `danger700` | `#b72b1a` | `#ee5e52` |
| **Success** | | |
| `success100` | `#eafbe7` | `#181826` |
| `success200` | `#c6f0c2` | `#4a4a6a` |
| `success500` | `#5cb176` | `#5cb176` |
| `success600` | `#328048` | `#5cb176` |
| `success700` | `#2f6846` | `#c6f0c2` |
| **Warning** | | |
| `warning100` | `#fdf4dc` | `#181826` |
| `warning200` | `#fae7b9` | `#4a4a6a` |
| `warning500` | `#f29d41` | `#f29d41` |
| `warning600` | `#d9822f` | `#f29d41` |
| `warning700` | `#be5d01` | `#fae7b9` |
| **Alternative** | | |
| `alternative100` | `#f6ecfc` | `#181826` |
| `alternative200` | `#e0c1f4` | `#4a4a6a` |
| `alternative500` | `#ac73e6` | `#ac73e6` |
| `alternative600` | `#9736e8` | `#ac73e6` |
| `alternative700` | `#8312d1` | `#e0c1f4` |
| **Neutral** | | |
| `neutral0` | `#ffffff` | `#212134` |
| `neutral100` | `#f6f6f9` | `#181826` |
| `neutral150` | `#eaeaef` | `#32324d` |
| `neutral200` | `#dcdce4` | `#4a4a6a` |
| `neutral300` | `#c0c0cf` | `#666687` |
| `neutral400` | `#a5a5ba` | `#a5a5ba` |
| `neutral500` | `#8e8ea9` | `#c0c0cf` |
| `neutral600` | `#666687` | `#a5a5ba` |
| `neutral700` | `#4a4a6a` | `#eaeaef` |
| `neutral800` | `#32324d` | `#ffffff` |
| `neutral900` | `#212134` | `#ffffff` |
| `neutral1000` | `#181826` | `#ffffff` |
| **Button** | | |
| `buttonNeutral0` | `#ffffff` | `#ffffff` |
| `buttonPrimary500` | `#7b79ff` | `#7b79ff` |
| `buttonPrimary600` | `#4945ff` | `#4945ff` |

---

## Shadows

| Token | Light | Dark |
|-------|-------|------|
| `filterShadow` | `0px 1px 4px rgba(33, 33, 52, 0.1)` | `1px 1px 10px rgba(3, 3, 5, 0.35)` |
| `focus` | `inset 2px 0px 0px rgb(39, 31, 224), inset 0px 2px 0px rgb(39, 31, 224), inset -2px 0px 0px rgb(39, 31, 224), inset 0px -2px 0px rgb(39, 31, 224)` | same |
| `focusShadow` | `0px 0px 6px rgba(76, 191, 255, 0.75)` | same |
| `popupShadow` | `0px 2px 15px rgba(33, 33, 52, 0.1)` | `1px 1px 10px rgba(3, 3, 5, 0.35)` |
| `tableShadow` | `0px 1px 4px rgba(33, 33, 52, 0.1)` | `1px 1px 10px rgba(3, 3, 5, 0.2)` |

---

## Spacing

12-step scale (shared by light and dark). Arrays replace entirely — provide all 12 values.

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

Shared by light and dark. Arrays replace entirely.

### Font Sizes (8-step)

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

### Line Heights (7 values)

| Index | Default |
|-------|---------|
| 0 | `1.14` |
| 1 | `1.22` |
| 2 | `1.25` |
| 3 | `1.33` |
| 4 | `1.43` |
| 5 | `1.45` |
| 6 | `1.5` |

---

## Border Radius

Shared by light and dark.

| Token | Default |
|-------|---------|
| `borderRadius` | `4px` |

---

## Breakpoints

Shared by light and dark.

| Token | Default |
|-------|---------|
| `initial` | `0px` |
| `small` | `520px` |
| `medium` | `768px` |
| `large` | `1080px` |

---

## Z-Index

Shared by light and dark.

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

Shared by light and dark.

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
- [Light colors](https://github.com/strapi/design-system/blob/main/packages/design-system/src/themes/lightTheme/light-colors.ts)
- [Dark colors](https://github.com/strapi/design-system/blob/main/packages/design-system/src/themes/darkTheme/dark-colors.ts)
- [Light shadows](https://github.com/strapi/design-system/blob/main/packages/design-system/src/themes/lightTheme/light-shadows.ts)
- [Dark shadows](https://github.com/strapi/design-system/blob/main/packages/design-system/src/themes/darkTheme/dark-shadows.ts)
- [Common theme](https://github.com/strapi/design-system/blob/main/packages/design-system/src/themes/common-theme.ts)
- [Sizes](https://github.com/strapi/design-system/blob/main/packages/design-system/src/themes/sizes.ts)
- [extendTheme (merge behavior)](https://github.com/strapi/design-system/blob/main/packages/design-system/src/themes/extendTheme.ts)

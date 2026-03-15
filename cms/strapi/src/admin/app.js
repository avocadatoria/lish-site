import { setPluginConfig, defaultHtmlPreset } from '@_sh/strapi-plugin-ckeditor';
import strapiThemeDefaults from './strapi-theme-defaults';

// ── Toolbar tweaks ──────────────────────────────────────────
// Hardcoded toolbar — explicit order, no guessing
defaultHtmlPreset.editorConfig.toolbar = [
  'heading',
  'bold',
  'italic',
  'strikethrough',
  'alignment',
  'indent', 'outdent',
  'bulletedList',
  'numberedList',
  'link',
  'strapiMediaLib',
  'blockQuote',
  'insertTable',
  'htmlEmbed',
  'sourceEditing',
  'specialCharacters',
  'horizontalLine',
  'undo',
  'redo',
];

delete defaultHtmlPreset.editorConfig.fontFamily;

// ── Image styles: remove "side" and "inline" ────────────────
defaultHtmlPreset.editorConfig.image.styles.options =
  defaultHtmlPreset.editorConfig.image.styles.options.filter((opt) => {
    const name = typeof opt === 'string' ? opt : opt.name;
    return name !== 'side' && name !== 'inline';
  });

// ── Alignment: default left, no justify ─────────────────────
defaultHtmlPreset.editorConfig.alignment = {
  options: ['left', 'center', 'right'],
};

// ── Headings: 1–4 only ──────────────────────────────────────
defaultHtmlPreset.editorConfig.heading.options =
  defaultHtmlPreset.editorConfig.heading.options.filter(
    (opt) => opt.model !== 'heading5' && opt.model !== 'heading6'
  );

// ── Paste/drag: strip everything except structural formatting ─
// Allowed on paste: headings, bold, italic, strikethrough, alignment,
// indentation, lists, links, blockquotes, tables, raw HTML.
// Stripped on paste: images, media, inline styles, classes, font styles,
// colors, backgrounds — anything not controllable via the toolbar.
defaultHtmlPreset.editorConfig.htmlSupport = {
  disallow: [
    {
      name: /./,
      styles: true,
      classes: true,
    },
    {
      name: 'span',
    },
  ],
};

// Block image/media paste and drag
defaultHtmlPreset.editorConfig.removePlugins = [
  ...(defaultHtmlPreset.editorConfig.removePlugins || []),
  'ImageUploadViaUrl', 'AutoImage',
];
defaultHtmlPreset.editorConfig.pasteFromOffice = {
  keepOriginalStyling: false,
};
defaultHtmlPreset.editorConfig.pasteFromOfficeEnhanced = {
  keepOriginalStyling: false,
};
defaultHtmlPreset.editorConfig.clipboard = {
  ...(defaultHtmlPreset.editorConfig.clipboard || {}),
  handleImages: false,
};

const theme = JSON.parse(JSON.stringify(strapiThemeDefaults));

const config = {
  theme,
  tutorials: false,
  notifications: { releases: false },
  locales: [],
  translations: {
    en: {
      'Auth.form.welcome.title': 'LISH CMS',
      'Auth.form.welcome.subtitle': 'Log in to your account',
    },
  },
};

export default {
  config,
  register() {
    setPluginConfig({ presets: [defaultHtmlPreset] });
  },
  bootstrap() {
    import('./strapi.scss');
  },
};

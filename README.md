# Pairloom — Legal pages (GitHub Pages)

Static **Privacy Policy** and **Terms of Use** for **Pairloom** (`game.memory.cards`) in **20 languages**.

## Languages

English, 简体中文, Español, हिन्दी, العربية, Português, Русский, 日本語, Deutsch, Français, 한국어, Italiano, Türkçe, Tiếng Việt, Polski, Українська, Bahasa Indonesia, Nederlands, ไทย, বাংলা.

Switch language via the dropdown on each page or URL parameter:

```
https://addeo.github.io/memory-terms/terms.html?lang=ru
https://addeo.github.io/memory-terms/privacy.html?lang=de
```

Legacy URLs `terms-ru.html` redirect to `terms.html?lang=ru`.

Non-English texts are machine-translated for convenience; **English prevails** if texts differ. Have a lawyer review before store submission.

## Files

| Path | Description |
|------|-------------|
| `index.html` | Landing page |
| `terms.html` / `privacy.html` | Document shells (content from JSON) |
| `assets/i18n.js` | Language detection and rendering |
| `locales/languages.json` | Supported language codes |
| `locales/terms/*.json` | Terms per language |
| `locales/privacy/*.json` | Privacy per language |
| `locales/ui/*.json` | UI labels per language |
| `scripts/translate-locales.py` | Regenerate translations from `en` sources |

## Regenerate translations

```bash
pip3 install -r requirements.txt
npm run translate
```

Edit `locales/terms/en.json` and `locales/privacy/en.json`, then run the script.

## Deploy on GitHub Pages

1. Push to `main` (GitHub Actions updates `gh-pages`).
2. **Settings → Pages → Source**: branch **`gh-pages`**, folder **`/ (root)`**.

URLs:

```
https://addeo.github.io/memory-terms/terms.html
https://addeo.github.io/memory-terms/privacy.html
```

## App links

```typescript
export const environment = {
  privacyPolicyUrl: 'https://addeo.github.io/memory-terms/privacy.html',
  termsOfUseUrl: 'https://addeo.github.io/memory-terms/terms.html',
};

// Optional: pick locale in the app
function legalUrl(base: string, locale: string): string {
  const lang = locale.split('-')[0];
  return `${base}?lang=${encodeURIComponent(lang)}`;
}
```

Contact in documents: **Sergey Kosilov**, **supp0rt.serg@yandex.com**, governing law **Russian Federation**.

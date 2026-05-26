# Pairloom — Legal pages (GitHub Pages)

Static **Privacy Policy** and **Terms of Use** for **Pairloom** (`game.memory.cards`), in **English** and **Russian**.

## Files

| File | Description |
|------|-------------|
| `index.html` | English landing page |
| `index-ru.html` | Russian landing page |
| `terms.html` | Terms of Use (EN) |
| `terms-ru.html` | Условия использования (RU) |
| `privacy.html` | Privacy Policy (EN) |
| `privacy-ru.html` | Политика конфиденциальности (RU) |
| `assets/style.css` | Shared styles (light/dark) |

## Deploy on GitHub Pages

1. Create a **public** repository on GitHub (e.g. `memory-terms` or `pairloom-legal`).
2. Push this folder to the repo root:

```bash
cd /Users/sergejkosilov/memory-terms
git init
git add .
git commit -m "Add Pairloom legal pages for GitHub Pages"
git branch -M main
git remote add origin git@github.com:<YOUR_USER>/<REPO>.git
git push -u origin main
```

3. In the repo: **Settings → Pages → Build and deployment → Source**:
   - Branch: **`gh-pages`**
   - Folder: **`/ (root)`**
4. Pushes to `main` auto-update `gh-pages` via GitHub Actions (`.github/workflows/deploy-pages.yml`).
5. After deploy (1–2 minutes), URLs look like:

```
https://<user>.github.io/<repo>/terms.html
https://<user>.github.io/<repo>/terms-ru.html
https://<user>.github.io/<repo>/privacy.html
https://<user>.github.io/<repo>/privacy-ru.html
```

If the repo is named `<user>.github.io`, omit `<repo>` from the path.

## Links for your app

Use **HTTPS** URLs in `environment`, App Store Connect, and Google Play:

```typescript
// Example (replace with your deployed base URL)
export const environment = {
  privacyPolicyUrl: 'https://<user>.github.io/<repo>/privacy.html',
  termsOfUseUrl: 'https://<user>.github.io/<repo>/terms.html',
  // Optional locale-specific links in the app:
  privacyPolicyUrlRu: 'https://<user>.github.io/<repo>/privacy-ru.html',
  termsOfUseUrlRu: 'https://<user>.github.io/<repo>/terms-ru.html',
};
```

Pick **one language per store locale** (EN for global, RU for Russia) or open the URL that matches the app language.

## Before publishing

- Re-read the text if your practices differ (analytics, crash reporting, business entity).
- This is **not legal advice**; consider a lawyer for store and 152-ФЗ compliance where applicable.

Contact in documents: **Sergey Kosilov**, **supp0rt.serg@yandex.com**, governing law **Russian Federation**.

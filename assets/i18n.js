(function () {
  'use strict';

  const STORAGE_KEY = 'pairloom-legal-lang';
  const DEFAULT_LANG = 'en';

  let languages = [];
  let uiStrings = {};

  function getPageKind() {
    const path = window.location.pathname.split('/').pop() || '';
    if (path.startsWith('privacy')) return 'privacy';
    if (path.startsWith('terms')) return 'terms';
    return 'index';
  }

  function getQueryLang() {
    const params = new URLSearchParams(window.location.search);
    const lang = (params.get('lang') || '').toLowerCase();
    return lang || null;
  }

  function normalizeLang(code) {
    if (!code) return null;
    const base = code.toLowerCase().split('-')[0];
    if (languages.some((l) => l.code === base)) return base;
    if (base === 'zh' && languages.some((l) => l.code === 'zh')) return 'zh';
    return null;
  }

  function resolveLang() {
    const fromQuery = normalizeLang(getQueryLang());
    if (fromQuery) return fromQuery;

    const stored = normalizeLang(localStorage.getItem(STORAGE_KEY));
    if (stored) return stored;

    const nav = navigator.languages || [navigator.language];
    for (const raw of nav) {
      const match = normalizeLang(raw);
      if (match) return match;
    }
    return DEFAULT_LANG;
  }

  function persistLang(lang) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (_) {
      /* ignore */
    }
    const url = new URL(window.location.href);
    url.searchParams.set('lang', lang);
    window.history.replaceState({}, '', url);
  }

  async function fetchJson(url) {
    const res = await fetch(url, { cache: 'default' });
    if (!res.ok) throw new Error(`Failed to load ${url}`);
    return res.json();
  }

  async function loadLanguages() {
    languages = await fetchJson('locales/languages.json');
  }

  async function loadUi(lang) {
    try {
      uiStrings = await fetchJson(`locales/ui/${lang}.json`);
    } catch (_) {
      uiStrings = await fetchJson(`locales/ui/${DEFAULT_LANG}.json`);
    }
  }

  async function loadDocument(kind, lang) {
    try {
      return await fetchJson(`locales/${kind}/${lang}.json`);
    } catch (_) {
      if (lang !== DEFAULT_LANG) {
        return fetchJson(`locales/${kind}/${DEFAULT_LANG}.json`);
      }
      throw _;
    }
  }

  function t(key) {
    return uiStrings[key] || key;
  }

  function renderLangSelect(currentLang, kind) {
    const nav = document.getElementById('lang-nav');
    if (!nav) return;

    const label = document.createElement('label');
    label.className = 'lang-select-label';
    label.setAttribute('for', 'lang-select');
    label.textContent = t('selectLanguage');

    const select = document.createElement('select');
    select.id = 'lang-select';
    select.className = 'lang-select';
    select.setAttribute('aria-label', t('selectLanguage'));

    for (const lang of languages) {
      const opt = document.createElement('option');
      opt.value = lang.code;
      opt.textContent = lang.native;
      opt.selected = lang.code === currentLang;
      select.appendChild(opt);
    }

    select.addEventListener('change', () => {
      const next = select.value;
      persistLang(next);
      window.location.reload();
    });

    nav.replaceChildren(label, select);
  }

  function renderHeader(currentLang) {
    const home = document.getElementById('home-link');
    if (home) {
      home.href = `index.html?lang=${encodeURIComponent(currentLang)}`;
      home.textContent = t('allDocuments').trim();
    }
    renderLangSelect(currentLang, getPageKind());
  }

  function renderTerms(doc, currentLang) {
    const root = document.getElementById('legal-content');
    root.replaceChildren();

    const h1 = document.createElement('h1');
    h1.textContent = doc.title;
    root.appendChild(h1);

    const meta = document.createElement('p');
    meta.className = 'meta';
    meta.innerHTML =
      `<strong>Pairloom</strong> (${doc.metaTagline}) · App ID <code>game.memory.cards</code> · ` +
      `${t('metaLastUpdated') || 'Last updated'}: <time datetime="${doc.metaLastUpdatedIso}">${doc.metaLastUpdated}</time>`;
    root.appendChild(meta);

    if (currentLang !== DEFAULT_LANG) {
      const notice = document.createElement('p');
      notice.className = 'notice';
      notice.textContent = t('translationNotice');
      root.appendChild(notice);
    }

    const intro = document.createElement('p');
    intro.innerHTML = doc.intro;
    root.appendChild(intro);

    for (const section of doc.sections) {
      const h2 = document.createElement('h2');
      h2.textContent = section.heading;
      root.appendChild(h2);

      if (section.paragraphs) {
        for (const pText of section.paragraphs) {
          const p = document.createElement('p');
          p.innerHTML = pText;
          root.appendChild(p);
        }
      }

      if (section.list) {
        const ul = document.createElement('ul');
        for (const item of section.list) {
          const li = document.createElement('li');
          li.innerHTML = `<strong>${item.label}</strong> ${item.text}`;
          ul.appendChild(li);
        }
        root.appendChild(ul);
      }
    }

    renderFooter(currentLang, 'privacy');
  }

  function renderPrivacy(doc, currentLang) {
    const root = document.getElementById('legal-content');
    root.replaceChildren();

    const h1 = document.createElement('h1');
    h1.textContent = doc.title;
    root.appendChild(h1);

    const meta = document.createElement('p');
    meta.className = 'meta';
    meta.innerHTML =
      `<strong>Pairloom</strong> (${doc.metaTagline}) · App ID <code>game.memory.cards</code> · ` +
      `${t('metaLastUpdated') || 'Last updated'}: <time datetime="${doc.metaLastUpdatedIso}">${doc.metaLastUpdated}</time>`;
    root.appendChild(meta);

    if (currentLang !== DEFAULT_LANG) {
      const notice = document.createElement('p');
      notice.className = 'notice';
      notice.textContent = t('translationNotice');
      root.appendChild(notice);
    }

    const intro = document.createElement('p');
    intro.innerHTML = doc.intro;
    root.appendChild(intro);

    for (const section of doc.sections) {
      const h2 = document.createElement('h2');
      h2.textContent = section.heading;
      root.appendChild(h2);

      if (section.paragraphs) {
        for (const pText of section.paragraphs) {
          const p = document.createElement('p');
          p.innerHTML = pText;
          root.appendChild(p);
        }
      }

      if (section.bullets) {
        const ul = document.createElement('ul');
        for (const item of section.bullets) {
          const li = document.createElement('li');
          li.innerHTML = item;
          ul.appendChild(li);
        }
        root.appendChild(ul);
      }

      if (section.subsections) {
        for (const sub of section.subsections) {
          const subTitle = document.createElement('p');
          subTitle.innerHTML = `<strong>${sub.title}</strong>`;
          root.appendChild(subTitle);

          if (sub.paragraphs) {
            for (const pText of sub.paragraphs) {
              const p = document.createElement('p');
              p.innerHTML = pText;
              root.appendChild(p);
            }
          }

          if (sub.bullets) {
            const ul = document.createElement('ul');
            for (const item of sub.bullets) {
              const li = document.createElement('li');
              li.innerHTML = item;
              ul.appendChild(li);
            }
            root.appendChild(ul);
          }

          if (sub.paragraphsAfter) {
            for (const pText of sub.paragraphsAfter) {
              const p = document.createElement('p');
              p.innerHTML = pText;
              root.appendChild(p);
            }
          }

          if (sub.links) {
            const ul = document.createElement('ul');
            for (const link of sub.links) {
              const li = document.createElement('li');
              const host = link.href.replace(/^https?:\/\//, '').replace(/\/$/, '');
              li.innerHTML = `${link.label}: <a href="${link.href}" rel="noopener noreferrer">${host}</a>`;
              ul.appendChild(li);
            }
            root.appendChild(ul);
          }
        }
      }
    }

    renderFooter(currentLang, 'terms');
  }

  function renderFooter(currentLang, otherKind) {
    const footer = document.getElementById('legal-footer');
    if (!footer) return;
    const otherLabel = otherKind === 'terms' ? t('termsOfUse') : t('privacyPolicy');
    footer.innerHTML =
      `<a href="${otherKind}.html?lang=${encodeURIComponent(currentLang)}">${otherLabel}</a> · ` +
      `<a href="index.html?lang=${encodeURIComponent(currentLang)}">${t('allDocuments')}</a>`;
  }

  function renderIndex(currentLang) {
    document.title = t('siteTitle');
    const heading = document.getElementById('index-heading');
    const operator = document.getElementById('index-operator');
    const docsTitle = document.getElementById('docs-title');
    const privacyLink = document.getElementById('privacy-link');
    const termsLink = document.getElementById('terms-link');
    const forAppTitle = document.getElementById('for-app-title');

    if (heading) heading.textContent = t('pageHeading');
    if (operator) operator.textContent = `${t('operator')} · App ID game.memory.cards`;
    if (docsTitle) docsTitle.textContent = t('documents');
    if (privacyLink) {
      privacyLink.textContent = t('privacyPolicy');
      privacyLink.href = `privacy.html?lang=${encodeURIComponent(currentLang)}`;
    }
    if (termsLink) {
      termsLink.textContent = t('termsOfUse');
      termsLink.href = `terms.html?lang=${encodeURIComponent(currentLang)}`;
    }
    if (forAppTitle) forAppTitle.textContent = t('forApp');
  }

  function applyDocumentMeta(doc, currentLang) {
    document.documentElement.lang = currentLang;
    const langInfo = languages.find((l) => l.code === currentLang);
    document.documentElement.dir = langInfo?.rtl ? 'rtl' : 'ltr';
    document.title = `${doc.title} — Pairloom`;
  }

  async function init() {
    const kind = getPageKind();
    const root = document.getElementById('legal-content') || document.getElementById('index-root');
    if (!root) return;

    try {
      await loadLanguages();
      const currentLang = resolveLang();
      persistLang(currentLang);
      await loadUi(currentLang);
      renderHeader(currentLang);

      if (kind === 'index') {
        renderIndex(currentLang);
        return;
      }

      const doc = await loadDocument(kind, currentLang);
      applyDocumentMeta(doc, currentLang);

      if (kind === 'terms') {
        renderTerms(doc, currentLang);
      } else {
        renderPrivacy(doc, currentLang);
      }
    } catch (err) {
      console.error(err);
      if (root) {
        root.innerHTML = `<p class="error">${t('loadError') || 'Could not load this page.'}</p>`;
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

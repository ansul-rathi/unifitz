// Post-build prerender. Runs after the client build + SSR build:
//   1. dist/app.html  ← untouched SPA shell, served for every app route.
//   2. dist/index.html, dist/privacy.html, … ← real HTML for the public pages,
//      so crawlers, AI assistants and link previews see content without JS,
//      and first paint doesn't wait for the JS bundle. main.jsx hydrates it.
import { readFile, writeFile, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const ssrDir = path.join(root, 'dist-ssr');
const SITE = 'https://www.unifitz.in';

const PAGES = [
  { url: '/', file: 'index.html' },
  {
    url: '/privacy', file: 'privacy.html',
    title: 'Privacy policy | Unifitz',
    description: 'How Unifitz collects, uses and protects your personal information, and the choices you have.',
  },
  {
    url: '/terms', file: 'terms.html',
    title: 'Terms of service | Unifitz',
    description: 'The terms for using Unifitz live online fitness classes: membership, billing, auto-renewal, cancellation, class conduct and health disclaimer.',
  },
  {
    url: '/refund', file: 'refund.html',
    title: 'Cancellation & refund policy | Unifitz',
    description: 'How to cancel your Unifitz membership, when renewals stop, and when refunds apply.',
  },
];

const esc = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
// Replacement via a function so "$" in page text (prices!) is never read as a
// replacement pattern like $& or $1.
const sub = (html, pattern, value) => {
  const found = typeof pattern === 'string' ? html.includes(pattern) : pattern.test(html);
  if (!found) throw new Error(`prerender: pattern not found in index.html: ${pattern}`);
  return html.replace(pattern, () => value);
};

const template = await readFile(path.join(dist, 'index.html'), 'utf8');
const { render, faqJsonLd } = await import(path.join(ssrDir, 'entry-server.js'));

// SPA shell: no hardcoded canonical (RouteMeta sets one per route at runtime),
// and the app UI's Barlow fonts requested up front instead of after mount.
const APP_FONTS = 'https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@600;700;800;900&display=swap';
const shell = sub(template.replace(/\s*<link rel="canonical"[^>]*>/, ''), '</head>',
  `<link rel="stylesheet" href="${APP_FONTS}" data-app-fonts />\n  </head>`);
await writeFile(path.join(dist, 'app.html'), shell);

for (const page of PAGES) {
  const body = await render(page.url);
  if (!body || body.length < 500) throw new Error(`prerender: suspiciously empty output for ${page.url}`);
  let html = sub(template, '<div id="root"></div>', `<div id="root">${body}</div>`);
  if (page.url === '/') {
    html = sub(html, '</head>', `<script type="application/ld+json">${JSON.stringify(faqJsonLd).replace(/</g, '\\u003c')}</script>\n  </head>`);
  } else {
    const canonical = SITE + page.url;
    html = sub(html, /<title>[^<]*<\/title>/, `<title>${esc(page.title)}</title>`);
    html = sub(html, /<meta name="description" content="[^"]*"/, `<meta name="description" content="${esc(page.description)}"`);
    html = sub(html, /<link rel="canonical" href="[^"]*"/, `<link rel="canonical" href="${canonical}"`);
    html = sub(html, /<meta property="og:url" content="[^"]*"/, `<meta property="og:url" content="${canonical}"`);
    html = sub(html, /<meta property="og:title" content="[^"]*"/, `<meta property="og:title" content="${esc(page.title)}"`);
    html = sub(html, /<meta property="og:description" content="[^"]*"/, `<meta property="og:description" content="${esc(page.description)}"`);
  }
  await writeFile(path.join(dist, page.file), html);
  console.log(`prerendered ${page.url.padEnd(9)} → dist/${page.file} (${(html.length / 1024).toFixed(1)} KB)`);
}

await rm(ssrDir, { recursive: true, force: true });
// Supabase's client keeps timers alive in Node; we're done.
process.exit(0);

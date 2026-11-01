// Build-time renderer for the public marketing pages. Used only by
// scripts/prerender.mjs (`vite build --ssr`); never shipped to browsers.
// Must render the exact tree main.jsx hydrates, with StaticRouter in place
// of BrowserRouter.
import React from 'react';
import { Writable } from 'node:stream';
import { renderToPipeableStream, renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ViewModeProvider } from './context/ViewModeContext';
import { L } from './content/landing';
import { T as T20, FFW } from './content/twentyMinutes';
import { FAQ_ITEMS } from './lib/ffw';

// Head for /20minutes-fitness, from the page's own copy.
export const ffwMeta = { title: T20.meta.title, description: T20.meta.description, image: FFW.ogImage, imageAlt: 'FFW — 20-minute live workouts by Unifitz' };

const tree = url => (
  <React.StrictMode>
    <StaticRouter location={url}>
      <AuthProvider>
        <ToastProvider>
          <ViewModeProvider>
            <App />
          </ViewModeProvider>
        </ToastProvider>
      </AuthProvider>
    </StaticRouter>
  </React.StrictMode>
);

// Pass 1 streams the tree just to resolve every React.lazy route chunk
// (output discarded). Pass 2 renders to a string: lazies are resolved now, so
// nothing suspends. The string path also avoids React 18's byte-stream encoder,
// which emitted a stray NUL next to a multi-byte character (’ ”) at a buffer
// boundary.
function warm(url) {
  return new Promise((resolve, reject) => {
    const sink = new Writable({ write(_c, _e, cb) { cb(); }, final(cb) { resolve(); cb(); } });
    const { pipe } = renderToPipeableStream(tree(url), { onAllReady() { pipe(sink); }, onShellError: reject, onError: reject });
  });
}

export async function render(url) {
  await warm(url);
  return renderToString(tree(url));
}

// FAQPage structured data, generated from the same copy the page renders.
const faqPage = items => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
});
export const faqJsonLd = faqPage(L.faq.groups.flatMap(g => g.items));
export const ffwFaqJsonLd = faqPage(FAQ_ITEMS);

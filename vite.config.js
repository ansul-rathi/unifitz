import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vendor chunking. Function form (not the object form) so Rollup can't drag
// shared helpers or react/jsx-runtime into the pdf/motion chunks — with the
// object form the entry ended up statically importing pdf-*.js + motion-*.js,
// which preloaded jsPDF (~130 KB gz) on the landing page.
function manualChunks(id) {
  // Vite/Rollup runtime helpers are needed by every page; left unassigned,
  // Rollup parks them in whichever manual chunk it meets first (it chose pdf).
  if (/vite\/preload-helper|commonjsHelpers|vite\/modulepreload-polyfill/.test(id)) return 'react';
  if (!id.includes('node_modules')) return;
  if (/node_modules\/(\.pnpm\/[^/]+\/node_modules\/)?(react|react-dom|react-router|react-router-dom|scheduler|@remix-run)\//.test(id)) return 'react';
  if (id.includes('/@supabase/')) return 'supabase';
  if (/\/(recharts|d3-[a-z-]+|victory-vendor)\//.test(id)) return 'charts';
  if (/\/(jspdf|html2canvas|canvg|dompurify|fflate)\//.test(id)) return 'pdf';
  if (/\/(framer-motion|motion-dom|motion-utils)\//.test(id)) return 'motion';
}

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  build: {
    rollupOptions: {
      // The SSR (prerender) bundle is a single node file — no vendor splitting.
      output: isSsrBuild ? {} : { manualChunks },
    },
  },
}));

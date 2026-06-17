import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Split heavy libs into their own cached chunks so they load only when
        // the pages that use them are visited (charts/PDF aren't on first paint).
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          supabase: ['@supabase/supabase-js'],
          charts: ['recharts'],
          pdf: ['jspdf'],
          motion: ['framer-motion'],
        },
      },
    },
  },
});

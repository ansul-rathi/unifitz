import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ViewModeProvider } from './context/ViewModeContext';
import './index.css';

const app = (
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <ViewModeProvider>
            <App />
          </ViewModeProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// Marketing pages (/, /privacy, …) ship prerendered HTML (scripts/prerender.mjs)
// — hydrate it so the content stays on screen. Everything else is the empty
// SPA shell (app.html) and renders from scratch.
const root = document.getElementById('root');
if (root.hasChildNodes()) ReactDOM.hydrateRoot(root, app);
else ReactDOM.createRoot(root).render(app);

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import './landing.css';

// Client-side 404. Real HTTP 404s for unknown URLs come from public/404.html
// (served by Vercel); keep the two visually in sync.
export default function NotFound() {
  useEffect(() => {
    document.title = 'Page not found | Unifitz';
    const m = document.createElement('meta');
    m.name = 'robots'; m.content = 'noindex';
    document.head.appendChild(m);
    return () => m.remove();
  }, []);
  return (
    <div className="uf min-h-screen flex flex-col items-center justify-center px-5 text-center" style={{ background: 'var(--cream-2)' }}>
      <Link to="/" className="uf-serif text-3xl font-semibold mb-8" style={{ color: 'var(--ink)' }}>Unifitz</Link>
      <p className="uf-serif leading-none" style={{ fontSize: 'clamp(4rem,18vw,8rem)', color: 'var(--clay)' }}>404</p>
      <h1 className="uf-h2 mt-3" style={{ fontSize: 'clamp(1.6rem,1.2rem+1.5vw,2.2rem)' }}>This page took a rest day.</h1>
      <p className="mt-3 uf-ink-soft max-w-sm">The page you’re looking for doesn’t exist or has moved.</p>
      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <Link to="/" className="uf-btn uf-btn--primary"><Home className="w-4 h-4" /> Go home</Link>
        <button type="button" onClick={() => window.history.back()} className="uf-btn uf-btn--ghost"><ArrowLeft className="w-4 h-4" /> Go back</button>
      </div>
    </div>
  );
}

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SiteFooter from '../../components/SiteFooter';
import { BUSINESS } from '../../config';

export const LEGAL_UPDATED = 'October 25, 2026';
export const OPERATOR = BUSINESS.legalName ? `${BUSINESS.legalName} (“Unifitz”, “we”, “us”)` : '“Unifitz”, “we”, “us”';
export const CONTACT = BUSINESS.grievanceOfficer || BUSINESS.email;

// Shared frame for the policy pages: brand header, readable measure, footer.
export default function LegalLayout({ title, description, children }) {
  useEffect(() => {
    document.title = `${title} | Unifitz`;
    const meta = document.querySelector('meta[name="description"]');
    const prev = meta?.getAttribute('content');
    meta?.setAttribute('content', description);
    window.scrollTo(0, 0);
    return () => { if (meta && prev) meta.setAttribute('content', prev); };
  }, [title, description]);

  return (
    <div className="uf min-h-screen flex flex-col">
      <header style={{ borderBottom: '1px solid var(--line)' }}>
        <nav className="max-w-6xl mx-auto flex items-center justify-between px-5 md:px-8 h-16" aria-label="Main">
          <Link to="/" className="uf-serif text-2xl font-semibold py-2" style={{ color: 'var(--ink)' }}>Unifitz</Link>
          <Link to="/" className="inline-flex items-center gap-1.5 min-h-11 text-[0.95rem] font-medium uf-ink-soft hover:text-[var(--clay)]"><ArrowLeft className="w-4 h-4" /> Back to home</Link>
        </nav>
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto px-5 md:px-8 py-12 md:py-16">
        <article className="uf-prose">
          <h1 className="uf-h2">{title}</h1>
          <p className="!mt-3 text-[0.9rem]">Last updated: {LEGAL_UPDATED}</p>
          {children}
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}

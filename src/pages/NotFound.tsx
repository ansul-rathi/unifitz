import { FC } from 'react';
import { Helmet } from 'react-helmet-async';
import { WA_TRIAL } from '../constants/contact';

const NotFound: FC = () => (
  <>
    <Helmet>
      <title>Page Not Found | Unifitz</title>
      <meta name="robots" content="noindex" />
    </Helmet>
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#180d2c] text-white font-lexend px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary-container flex items-center justify-center glow-pink mb-6">
        <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
          fitness_center
        </span>
      </div>
      <h1 className="text-6xl font-black mb-3 text-primary-container">404</h1>
      <h2 className="text-xl font-bold mb-3">Page not found</h2>
      <p className="text-white/60 font-jakarta mb-8 max-w-sm">
        Looks like this page took a detour. Let&apos;s get you back on track.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <a
          href="/"
          className="bg-primary-container text-white px-6 py-3 rounded-full font-bold text-xs tracking-widest uppercase glow-pink hover:brightness-110 transition-all focus-visible:ring-2 focus-visible:ring-primary-container focus-visible:outline-none"
        >
          Back to Home
        </a>
        <a
          href={WA_TRIAL}
          target="_blank"
          rel="noreferrer"
          className="border border-primary-container/40 text-primary-container px-6 py-3 rounded-full font-bold text-xs tracking-widest uppercase hover:bg-primary-container/10 transition-all focus-visible:ring-2 focus-visible:ring-primary-container focus-visible:outline-none"
        >
          Join Free Trial
        </a>
      </div>
    </div>
  </>
);

export default NotFound;

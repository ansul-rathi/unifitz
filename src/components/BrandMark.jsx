// The Unifitz "U" mark — same artwork as public/favicon.svg, so the app logo,
// browser tab and home-screen icon match. Pair with the single word "Unifitz".
export default function BrandMark({ className = 'w-8 h-8' }) {
  return (
    <svg viewBox="0 0 64 64" className={`shrink-0 ${className}`} aria-hidden="true" focusable="false">
      <rect width="64" height="64" rx="14" fill="#C2410C" />
      <path d="M20 15v18.5a12 12 0 0 0 24 0V15" fill="none" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" />
      <circle cx="32" cy="52.5" r="3.2" fill="#FFE7D3" />
    </svg>
  );
}

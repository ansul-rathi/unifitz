import { Link } from 'react-router-dom';
import { Dumbbell, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-slate-50 flex flex-col items-center justify-center px-4 text-center">
      <Link to="/" className="flex items-center gap-2 font-display text-2xl font-bold uppercase text-slate-900 mb-8">
        <Dumbbell className="w-7 h-7 text-brand-500" /> Uni<span className="text-brand-500">Fit</span>
      </Link>
      <p className="font-display text-[clamp(4rem,18vw,9rem)] font-extrabold leading-none text-brand-500">404</p>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-2 text-slate-600 max-w-sm">The page you're looking for doesn't exist or has moved.</p>
      <div className="mt-7 flex flex-col sm:flex-row gap-3">
        <Link to="/" className="btn-primary"><Home className="w-4 h-4" /> Go home</Link>
        <button onClick={() => window.history.back()} className="btn-secondary"><ArrowLeft className="w-4 h-4" /> Go back</button>
      </div>
    </div>
  );
}

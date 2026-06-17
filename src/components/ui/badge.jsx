import { cva } from 'class-variance-authority';
import { cn } from '../../lib/cn';

const badgeVariants = cva('inline-flex items-center gap-1 rounded-full text-[11px] font-bold px-2.5 py-0.5', {
  variants: {
    tone: {
      brand: 'bg-brand-100 text-brand-700',
      emerald: 'bg-emerald-100 text-emerald-700',
      amber: 'bg-amber-100 text-amber-700',
      sky: 'bg-sky-100 text-sky-700',
      violet: 'bg-violet-100 text-violet-700',
      slate: 'bg-slate-100 text-slate-600',
      red: 'bg-red-100 text-red-600',
    },
  },
  defaultVariants: { tone: 'slate' },
});

export function Badge({ className, tone, ...props }) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

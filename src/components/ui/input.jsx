import { cn } from '../../lib/cn';

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'w-full rounded-xl border border-slate-300 px-4 py-3 text-base bg-white placeholder:text-slate-400',
        'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow duration-150',
        'aria-[invalid=true]:border-red-500 aria-[invalid=true]:focus:ring-red-500/40',
        className,
      )}
      {...props}
    />
  );
}

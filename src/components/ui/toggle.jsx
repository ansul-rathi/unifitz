import * as TogglePrimitive from '@radix-ui/react-toggle';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/cn';

const toggleVariants = cva(
  'inline-flex items-center justify-center gap-1.5 rounded-xl text-sm font-bold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-transparent hover:bg-slate-100 data-[state=on]:bg-slate-100',
        outline: 'border border-slate-200 bg-white hover:bg-slate-50 data-[state=on]:bg-brand-700 data-[state=on]:border-brand-700 data-[state=on]:text-white',
      },
      size: {
        default: 'h-10 px-3',
        sm: 'h-9 px-2.5',
        lg: 'min-h-12 px-3 py-2',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

export function Toggle({ className, variant, size, ...props }) {
  return <TogglePrimitive.Root className={cn(toggleVariants({ variant, size }), className)} {...props} />;
}

export { toggleVariants };

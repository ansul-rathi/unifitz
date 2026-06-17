import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/cn';

// shadcn-style Button. Use asChild to render a Link/anchor with button styling.
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-brand-500 text-white hover:bg-brand-600 shadow-sm',
        success: 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm',
        secondary: 'bg-white text-slate-800 border border-slate-200 hover:bg-slate-50',
        ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
        danger: 'bg-red-500 text-white hover:bg-red-600',
        outline: 'border border-slate-300 text-slate-700 hover:bg-slate-50',
      },
      size: {
        default: 'px-5 py-3',
        sm: 'px-3.5 py-2 text-xs',
        lg: 'px-7 py-3.5 text-base',
        icon: 'w-9 h-9 p-0',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

export function Button({ className, variant, size, asChild = false, ...props }) {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export { buttonVariants };

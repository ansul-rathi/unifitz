import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../../lib/cn';

// shadcn Select (Radix). Styled popover list: keyboard + typeahead, check on
// the chosen item, scroll arrows on long lists.
export const Select = SelectPrimitive.Root;
export const SelectGroup = SelectPrimitive.Group;
export const SelectValue = SelectPrimitive.Value;

export function SelectTrigger({ className, children, ...props }) {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        'flex w-full items-center justify-between gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-left cursor-pointer',
        'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow duration-150',
        'data-[placeholder]:text-slate-500 data-[state=open]:border-brand-500 data-[state=open]:ring-2 data-[state=open]:ring-brand-500/30',
        'aria-[invalid=true]:border-red-500 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:truncate',
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown aria-hidden="true" className="w-4 h-4 shrink-0 text-slate-500 transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function ScrollButton({ up }) {
  const Comp = up ? SelectPrimitive.ScrollUpButton : SelectPrimitive.ScrollDownButton;
  const Icon = up ? ChevronUp : ChevronDown;
  return (
    <Comp className="flex items-center justify-center py-1 text-slate-500 cursor-default">
      <Icon className="w-4 h-4" />
    </Comp>
  );
}

export function SelectContent({ className, children, position = 'popper', ...props }) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        position={position}
        className={cn(
          'relative z-[60] max-h-[min(var(--radix-select-content-available-height),22rem)] min-w-[8rem] overflow-hidden',
          'rounded-xl border border-slate-200 bg-white text-slate-900 shadow-xl',
          'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2',
          position === 'popper' && 'w-full min-w-[var(--radix-select-trigger-width)] data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1',
          className,
        )}
        {...props}
      >
        <ScrollButton up />
        <SelectPrimitive.Viewport className="p-1.5">{children}</SelectPrimitive.Viewport>
        <ScrollButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export function SelectLabel({ className, ...props }) {
  return <SelectPrimitive.Label className={cn('px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-slate-500', className)} {...props} />;
}

export function SelectItem({ className, children, ...props }) {
  return (
    <SelectPrimitive.Item
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center gap-2.5 rounded-lg py-2.5 pl-3 pr-9 text-[0.95rem] outline-none',
        'focus:bg-brand-50 focus:text-slate-900 data-[state=checked]:font-semibold data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText asChild><span className="flex flex-1 items-center gap-2.5 min-w-0">{children}</span></SelectPrimitive.ItemText>
      <span className="absolute right-3 flex items-center">
        <SelectPrimitive.ItemIndicator><Check className="w-4 h-4 text-brand-700" strokeWidth={3} /></SelectPrimitive.ItemIndicator>
      </span>
    </SelectPrimitive.Item>
  );
}

export function SelectSeparator({ className, ...props }) {
  return <SelectPrimitive.Separator className={cn('-mx-1 my-1 h-px bg-slate-100', className)} {...props} />;
}

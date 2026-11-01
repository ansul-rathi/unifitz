import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/cn';

export const Accordion = AccordionPrimitive.Root;

export function AccordionItem({ className, ...props }) {
  return <AccordionPrimitive.Item className={cn('border-b border-slate-200', className)} {...props} />;
}

export function AccordionTrigger({ className, children, ...props }) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        className={cn(
          'flex flex-1 items-center justify-between gap-4 py-4 text-left font-bold transition-all cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-md [&[data-state=open]>svg]:rotate-180',
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDown aria-hidden="true" className="w-5 h-5 shrink-0 text-brand-700 transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

export function AccordionContent({ className, children, ...props }) {
  return (
    <AccordionPrimitive.Content
      className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      {...props}
    >
      <div className={cn('pb-4', className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

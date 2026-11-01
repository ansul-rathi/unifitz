import { createContext, useContext } from 'react';
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';
import { cn } from '../../lib/cn';
import { toggleVariants } from './toggle';

const ToggleGroupContext = createContext({ variant: 'default', size: 'default' });

export function ToggleGroup({ className, variant, size, children, ...props }) {
  return (
    <ToggleGroupPrimitive.Root className={cn('flex items-center gap-1', className)} {...props}>
      <ToggleGroupContext.Provider value={{ variant, size }}>{children}</ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  );
}

export function ToggleGroupItem({ className, variant, size, ...props }) {
  const ctx = useContext(ToggleGroupContext);
  return (
    <ToggleGroupPrimitive.Item
      className={cn(toggleVariants({ variant: variant ?? ctx.variant, size: size ?? ctx.size }), className)}
      {...props}
    />
  );
}

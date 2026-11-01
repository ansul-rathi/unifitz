import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '../../lib/cn';

export function Progress({ className, indicatorClassName, value = 0, max = 100, ...props }) {
  return (
    <ProgressPrimitive.Root className={cn('relative h-2 w-full overflow-hidden rounded-full bg-brand-100', className)} value={value} max={max} {...props}>
      <ProgressPrimitive.Indicator
        className={cn('h-full w-full flex-1 rounded-full bg-brand-700 transition-transform', indicatorClassName)}
        style={{ transform: `translateX(-${100 - (value / max) * 100}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

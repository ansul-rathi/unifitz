import { cn } from '../../lib/cn';

export function Card({ className, ...props }) {
  return <div className={cn('bg-white rounded-2xl border border-slate-200 shadow-sm', className)} {...props} />;
}
export function CardHeader({ className, ...props }) {
  return <div className={cn('p-5 md:p-6 pb-0', className)} {...props} />;
}
export function CardContent({ className, ...props }) {
  return <div className={cn('p-5 md:p-6', className)} {...props} />;
}
export function CardTitle({ className, ...props }) {
  return <h3 className={cn('font-bold text-lg', className)} {...props} />;
}

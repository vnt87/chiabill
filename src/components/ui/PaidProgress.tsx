import { cn } from '../../lib/utils';

interface PaidProgressProps {
  paid: number;
  total: number;
  label: string;
  size?: 'sm' | 'md';
  className?: string;
}

// Static class names so Tailwind can see them; each segment fills a beat after the one before.
const FILL_DELAYS = [
  '[--fill-delay:0ms]', '[--fill-delay:90ms]', '[--fill-delay:180ms]', '[--fill-delay:270ms]',
  '[--fill-delay:360ms]', '[--fill-delay:450ms]', '[--fill-delay:540ms]', '[--fill-delay:630ms]',
];

/** A bar with one segment per participating player; each player who has paid fills a segment. */
export function PaidProgress({ paid, total, label, size = 'md', className }: PaidProgressProps) {
  if (total <= 0) return null;
  const complete = paid >= total;

  return (
    <div className={className}>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={paid}
        aria-valuetext={label}
        data-complete={complete}
        className={cn('segs', size === 'sm' ? 'h-4' : 'h-6')}
      >
        {Array.from({ length: total }, (_, index) => (
          <span key={index} data-filled={index < paid} className="seg">
            <span className={cn('seg__fill', FILL_DELAYS[Math.min(index, FILL_DELAYS.length - 1)])} />
          </span>
        ))}
      </div>
      <p
        className={cn(
          'mt-1.5',
          size === 'sm' ? 'text-xs' : 'text-sm',
          complete ? 'font-semibold text-slate-900 dark:text-wnt-yellow' : 'text-slate-600 dark:text-slate-400',
        )}
      >
        {label}
      </p>
    </div>
  );
}

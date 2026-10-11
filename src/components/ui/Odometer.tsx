import { useEffect, useState } from 'react';
import { cn } from '../../lib/utils';

interface OdometerProps {
  value: string;
  className?: string;
}

// Static class names so Tailwind can see them; one offset per digit.
const DIGIT_OFFSETS = [
  'translate-y-0',
  '-translate-y-[1.15em]',
  '-translate-y-[2.3em]',
  '-translate-y-[3.45em]',
  '-translate-y-[4.6em]',
  '-translate-y-[5.75em]',
  '-translate-y-[6.9em]',
  '-translate-y-[8.05em]',
  '-translate-y-[9.2em]',
  '-translate-y-[10.35em]',
];
const DELAYS = ['delay-0', 'delay-75', 'delay-150', 'delay-200', 'delay-300', 'delay-500', 'delay-700'];
const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

/** Digits roll up to their value on mount. The real text stays available to screen readers. */
export function Odometer({ value, className }: OdometerProps) {
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setSettled(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <span className={cn('inline-flex items-baseline', className)}>
      <span className="sr-only">{value}</span>
      <span aria-hidden="true" className="inline-flex items-baseline">
        {value.split('').map((char, index) => {
          const digit = Number(char);
          if (!/\d/.test(char)) {
            return <span key={index}>{char}</span>;
          }
          return (
            <span key={index} className="inline-block h-[1.15em] w-[0.62em] overflow-hidden text-center leading-none">
              <span
                className={cn(
                  'flex flex-col transition-transform duration-[1200ms] ease-out',
                  DELAYS[Math.min(index, DELAYS.length - 1)],
                  settled ? DIGIT_OFFSETS[digit] : DIGIT_OFFSETS[0],
                )}
              >
                {DIGITS.map((d) => (
                  <span key={d} className="block h-[1.15em] leading-[1.15em]">
                    {d}
                  </span>
                ))}
              </span>
            </span>
          );
        })}
      </span>
    </span>
  );
}

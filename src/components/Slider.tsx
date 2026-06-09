import clsx from 'clsx';

interface SliderProps {
  value: number;
  max: number;
  min?: number;
  step?: number;
  onChange: (value: number) => void;
  /** Accessible label, e.g. "Seek" or "Volume". */
  ariaLabel: string;
  /** Spoken value, e.g. "1:05 of 3:35" or "80 percent". */
  ariaValueText?: string;
  className?: string;
}

/**
 * Accessible range control: a native <input type="range"> (full keyboard + ARIA)
 * laid over a token-styled track/fill/thumb. Reused by ProgressBar and VolumeControl.
 */
export function Slider({
  value,
  max,
  min = 0,
  step = 0.01,
  onChange,
  ariaLabel,
  ariaValueText,
  className,
}: SliderProps) {
  const pct = max > min ? ((value - min) / (max - min)) * 100 : 0;

  return (
    <div className={clsx('group relative flex h-5 items-center', className)}>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
        <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
      </div>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent opacity-0 shadow-[0_0_10px_var(--accent)] transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
        style={{ left: `${pct}%` }}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={ariaLabel}
        aria-valuetext={ariaValueText}
        className="absolute inset-0 w-full cursor-pointer opacity-0"
      />
    </div>
  );
}

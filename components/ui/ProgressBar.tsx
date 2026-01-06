import React from 'react';

interface ProgressBarProps {
  /** Value from 0 to 100 */
  value: number;
  /** Show percentage label */
  showLabel?: boolean;
  /** Size variant */
  size?: 'sm' | 'md';
  /** Custom color override (otherwise uses thresholds) */
  color?: string;
  /** Thresholds for color coding (default: green >= 80, yellow >= 50, red < 50) */
  thresholds?: {
    high: number;
    medium: number;
  };
  /** Additional class names */
  className?: string;
  /** Show N/A for invalid values */
  showNA?: boolean;
}

const defaultThresholds = {
  high: 80,
  medium: 50,
};

const colors = {
  high: '#10b981', // Green
  medium: '#f59e0b', // Amber
  low: '#ef4444', // Red
  background: '#334155', // Slate-700
};

function getColorForValue(
  value: number,
  thresholds: { high: number; medium: number } = defaultThresholds
): string {
  if (value >= thresholds.high) return colors.high;
  if (value >= thresholds.medium) return colors.medium;
  return colors.low;
}

export function ProgressBar({
  value,
  showLabel = true,
  size = 'sm',
  color,
  thresholds = defaultThresholds,
  className = '',
  showNA = false,
}: ProgressBarProps) {
  const isInvalid = value < 0 || isNaN(value);
  const displayValue = isInvalid ? 0 : Math.min(100, Math.max(0, value));
  const barColor = color || getColorForValue(displayValue, thresholds);
  const heightClass = size === 'sm' ? 'h-2' : 'h-3';

  if (isInvalid && showNA) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div
          className={`flex-1 ${heightClass} rounded-full overflow-hidden`}
          style={{ backgroundColor: colors.background }}
        >
          <div className="h-full w-0" />
        </div>
        <span className="text-xs text-textMuted min-w-[36px] text-right">N/A</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className={`flex-1 ${heightClass} rounded-full overflow-hidden`}
        style={{ backgroundColor: colors.background }}
      >
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${displayValue}%`,
            backgroundColor: barColor,
          }}
        />
      </div>
      {showLabel && (
        <span
          className="text-xs font-medium min-w-[36px] text-right"
          style={{ color: barColor }}
        >
          {displayValue.toFixed(0)}%
        </span>
      )}
    </div>
  );
}

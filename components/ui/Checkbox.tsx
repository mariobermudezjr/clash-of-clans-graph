import React, { InputHTMLAttributes } from 'react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
}

export function Checkbox({ label, className = '', ...props }: CheckboxProps) {
  return (
    <label className="flex items-center gap-2 cursor-pointer group">
      <input
        type="checkbox"
        className={`w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-background transition-all duration-150 ${className}`}
        {...props}
      />
      <span className="text-sm text-text group-hover:text-primary transition-colors duration-150">
        {label}
      </span>
    </label>
  );
}

import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
}

export function Card({ children, className = '', title }: CardProps) {
  return (
    <div className={`bg-surface border border-border rounded-lg p-6 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-text mb-4">{title}</h3>
      )}
      {children}
    </div>
  );
}

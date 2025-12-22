import React from 'react';

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-border rounded ${className}`} />
  );
}

export function ChartSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-surface border border-border rounded-lg p-6 space-y-3">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-10 w-20" />
    </div>
  );
}

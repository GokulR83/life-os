import React from 'react';

export const SkeletonLoader = ({ type = 'card', count = 1, className = '' }) => {
  const items = Array.from({ length: count });

  if (type === 'ring') {
    return (
      <div className={`flex items-center justify-center p-8 rounded-3xl border border-theme-border bg-theme-card animate-pulse ${className}`}>
        <div className="h-32 w-32 rounded-full border-4 border-theme-card-hover/60 border-t-theme-accent/40 animate-spin" />
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className={`space-y-3 p-4 rounded-2xl border border-theme-border bg-theme-card ${className}`}>
        {items.map((_, i) => (
          <div key={i} className="h-10 w-full rounded-xl bg-theme-card-hover/50 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className={`grid gap-4 ${className}`}>
      {items.map((_, i) => (
        <div
          key={i}
          className="p-5 rounded-3xl border border-theme-border bg-theme-card space-y-3 animate-pulse"
        >
          <div className="h-4 w-1/3 rounded-md bg-theme-card-hover/60" />
          <div className="h-7 w-2/3 rounded-lg bg-theme-card-hover/80" />
          <div className="h-3 w-1/2 rounded-md bg-theme-card-hover/40" />
        </div>
      ))}
    </div>
  );
};

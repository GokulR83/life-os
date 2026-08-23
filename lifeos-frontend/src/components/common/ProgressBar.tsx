import React from 'react';

export const ProgressBar = ({ progress = 0, color = 'bg-theme-accent', height = 'h-2' }) => {
  const boundedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={`w-full rounded-full bg-theme-card-hover overflow-hidden ${height}`}>
      <div
        className={`${height} ${color} transition-all duration-500 rounded-full`}
        style={{ width: `${boundedProgress}%` }}
      />
    </div>
  );
};

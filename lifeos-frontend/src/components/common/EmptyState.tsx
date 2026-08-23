import React from 'react';
import { Sparkles, Plus } from 'lucide-react';

export interface EmptyStateProps {
  icon?: any;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Sparkles,
  title = 'No entries yet',
  description = 'Log your first item to begin tracking progress.',
  actionLabel = 'Add New',
  onAction,
  className = ''
}) => {
  return (
    <div className={`p-8 rounded-3xl border border-dashed border-theme-border bg-theme-surface/50 text-center space-y-3 flex flex-col items-center justify-center ${className}`}>
      <div className="p-3 rounded-2xl bg-theme-accent-light text-theme-accent border border-theme-border">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <h3 className="text-sm font-bold text-theme-main">{title}</h3>
        <p className="text-xs text-theme-muted mt-1 max-w-sm leading-relaxed">{description}</p>
      </div>
      {onAction && (
        <button
          onClick={onAction}
          className="mt-2 px-4 py-2 rounded-xl bg-gradient-dual text-white font-bold text-xs shadow-md shadow-theme-accent/20 transition active:scale-95 cursor-pointer flex items-center space-x-1.5"
        >
          <Plus className="h-4 w-4" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};

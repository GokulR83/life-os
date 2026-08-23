import React, { ReactNode } from 'react';

export interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple' | 'indigo' | string;
  size?: 'sm' | 'md' | 'lg' | string;
  className?: string;
  [key: string]: any;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-bold tracking-wide rounded-full border backdrop-blur-md transition-all duration-200';

  const sizeStyles: Record<string, string> = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-[11px]',
    lg: 'px-3 py-1.5 text-xs',
  };

  const variantStyles: Record<string, string> = {
    default: 'bg-slate-800/80 border-slate-700/60 text-slate-300',
    success: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
    warning: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
    error: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
    info: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400',
    purple: 'bg-purple-500/15 border-purple-500/30 text-purple-400',
    indigo: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400',
  };

  const selectedSize = sizeStyles[size] || sizeStyles.md;
  const selectedVariant = variantStyles[variant] || variantStyles.default;

  return (
    <span className={`${baseStyles} ${selectedSize} ${selectedVariant} ${className}`} {...props}>
      {children}
    </span>
  );
};

export default Badge;

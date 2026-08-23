import React from 'react';
import { AlertCircle } from 'lucide-react';

export interface FieldErrorProps {
  error?: string | null;
  className?: string;
}

export const FieldError: React.FC<FieldErrorProps> = ({ error, className = '' }) => {
  if (!error) return null;

  return (
    <p className={`text-[11px] font-semibold text-rose-400 mt-1.5 flex items-center gap-1.5 animate-fadeIn ${className}`}>
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      <span>{error}</span>
    </p>
  );
};

export default FieldError;

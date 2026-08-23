import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const STATUS_CONFIGS = {
  // Task statuses
  'Todo': { color: '#38bdf8', bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/30' },
  'In Progress': { color: '#f97316', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  'Done': { color: '#10b981', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  'Blocked': { color: '#f43f5e', bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },

  // Priorities
  'High': { color: '#ef4444', bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
  'Medium': { color: '#f59e0b', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  'Low': { color: '#10b981', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },

  // Job Application statuses
  'Wishlist': { color: '#a855f7', bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  'Applied': { color: '#3b82f6', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  'OA': { color: '#f59e0b', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  'Interview': { color: '#06b6d4', bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  'Offer': { color: '#10b981', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  'Rejected': { color: '#ef4444', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
};

export const CustomSelect = ({
  value,
  onChange,
  options = [],
  variant = 'status', // 'status' | 'default' | 'badge'
  size = 'sm', // 'xs' | 'sm' | 'md'
  placeholder = 'Select option',
  className = '',
  disabled = false,
  fullWidth = false,
  prefix = '',
  align = 'left'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Format options normalized into objects { value, label, colorConfig }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'object' && opt !== null) {
      return {
        value: opt.value,
        label: opt.label || opt.value,
        colorConfig: opt.colorConfig || STATUS_CONFIGS[opt.value] || null
      };
    }
    return {
      value: opt,
      label: prefix ? `${prefix} ${opt}` : opt,
      colorConfig: STATUS_CONFIGS[opt] || null
    };
  });

  const selectedOption = normalizedOptions.find((opt) => opt.value === value) || {
    value,
    label: value || placeholder,
    colorConfig: STATUS_CONFIGS[value] || null
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (val) => {
    if (disabled) return;
    setIsOpen(false);
    if (onChange) {
      // Support both event pattern (e.target.value) and direct value pattern
      onChange({ target: { value: val }, value: val });
    }
  };

  // Size styling classes
  const sizeClasses = {
    xs: 'px-2 py-0.5 text-[10px] gap-1 rounded-lg',
    sm: 'px-2.5 py-1 text-xs gap-1.5 rounded-xl',
    md: 'px-3.5 py-2 text-xs font-semibold gap-2 rounded-xl'
  };

  // Icon size
  const iconSizes = {
    xs: 'h-2.5 w-2.5',
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5'
  };

  const statusConfig = selectedOption.colorConfig;

  // Variant classes for trigger button
  let variantClasses = 'bg-theme-surface hover:bg-theme-card-hover text-theme-main border border-theme-border';
  if (variant === 'status' && statusConfig) {
    variantClasses = `${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border shadow-xs hover:brightness-110 font-bold`;
  }

  return (
    <div
      ref={dropdownRef}
      className={`relative inline-block text-left select-none ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between transition-all duration-200 outline-none cursor-pointer focus:ring-2 focus:ring-theme-accent/40 ${
          sizeClasses[size] || sizeClasses.sm
        } ${variantClasses} ${fullWidth ? 'w-full' : ''} ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${isOpen ? 'ring-2 ring-theme-accent/50 border-theme-accent scale-[0.99]' : ''}`}
      >
        <div className="flex items-center gap-1.5 truncate">
          {statusConfig?.color && (
            <span
              className="inline-block rounded-full shrink-0 shadow-xs animate-pulse"
              style={{
                backgroundColor: statusConfig.color,
                width: size === 'xs' ? '6px' : '7px',
                height: size === 'xs' ? '6px' : '7px',
                boxShadow: `0 0 6px ${statusConfig.color}80`
              }}
            />
          )}
          <span className="truncate">{selectedOption.label}</span>
        </div>

        <ChevronDown
          className={`${iconSizes[size] || iconSizes.sm} shrink-0 opacity-70 transition-transform duration-200 ${
            isOpen ? 'rotate-180 opacity-100 text-theme-accent' : ''
          }`}
        />
      </button>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} mt-1.5 w-max min-w-full z-[9999] rounded-xl bg-theme-card/95 backdrop-blur-xl border border-theme-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
            fullWidth ? 'left-0 right-0' : 'min-w-[150px]'
          }`}
          style={{ transformOrigin: align === 'right' ? 'top right' : 'top left' }}
        >
          <div className="p-1 max-h-56 overflow-y-auto space-y-0.5 custom-scrollbar">
            {normalizedOptions.map((opt) => {
              const isSelected = opt.value === value;
              const optStatus = opt.colorConfig;

              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-theme-accent/15 text-theme-accent font-bold'
                      : 'text-theme-main hover:bg-theme-card-hover hover:text-theme-main'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {optStatus?.color ? (
                      <span
                        className="inline-block rounded-full shrink-0"
                        style={{
                          backgroundColor: optStatus.color,
                          width: '7px',
                          height: '7px',
                          boxShadow: isSelected ? `0 0 8px ${optStatus.color}` : 'none'
                        }}
                      />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-theme-muted/40" />
                    )}
                    <span className="truncate">{opt.label}</span>
                  </div>

                  {isSelected && (
                    <Check className="h-3.5 w-3.5 text-theme-accent shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;

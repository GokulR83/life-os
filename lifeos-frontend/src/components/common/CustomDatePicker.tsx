import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { CalendarDays, ChevronLeft, ChevronRight, ChevronDown, RotateCcw } from 'lucide-react';
import { formatDateDisplay } from '../../utils/dateUtils';

const MONTH_NAMES_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const CustomDatePicker = ({
  value,
  onChange,
  size = 'sm', // 'xs' | 'sm' | 'md'
  placeholder = 'Select Date',
  className = '',
  disabled = false,
  fullWidth = false,
  position = 'auto', // 'auto' | 'top' | 'bottom'
  align = 'auto' // 'auto' | 'left' | 'right'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPositioned, setIsPositioned] = useState(false);
  const [viewMode, setViewMode] = useState('days'); // 'days' | 'months' | 'years'
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, openUpward: false });

  const calculateCoords = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const popoverHeight = 340;
      const popoverWidth = 288; // w-72 = 288px
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUp = position === 'top' || (position === 'auto' && spaceBelow < popoverHeight && rect.top > popoverHeight);

      let top = openUp ? Math.max(12, rect.top - popoverHeight - 8) : rect.bottom + 8;
      let left = rect.left;

      if (align === 'right' || left + popoverWidth > window.innerWidth - 16) {
        left = Math.max(16, rect.right - popoverWidth);
      }

      return { top, left, openUpward: openUp };
    }
    return { top: 0, left: 0, openUpward: false };
  };

  const handleToggle = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!isOpen) {
      const initialCoords = calculateCoords();
      setCoords(initialCoords);
      setIsPositioned(true);
      setIsOpen(true);
    } else {
      setIsOpen(false);
      setIsPositioned(false);
    }
  };

  useLayoutEffect(() => {
    if (isOpen) {
      const currentCoords = calculateCoords();
      setCoords(currentCoords);
      setIsPositioned(true);

      const handleUpdate = () => {
        setCoords(calculateCoords());
      };

      window.addEventListener('resize', handleUpdate);
      window.addEventListener('scroll', handleUpdate, true);
      return () => {
        window.removeEventListener('resize', handleUpdate);
        window.removeEventListener('scroll', handleUpdate, true);
      };
    } else {
      setIsPositioned(false);
    }
  }, [isOpen, position, align]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current && !buttonRef.current.contains(event.target as Node) &&
        popupRef.current && !popupRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setIsPositioned(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Parse input value (YYYY-MM-DD or ISO string)
  const parseDate = (val: any) => {
    if (!val) return new Date();
    try {
      const d = new Date(val);
      return isNaN(d.getTime()) ? new Date() : d;
    } catch {
      return new Date();
    }
  };

  const selectedDate = value ? parseDate(value) : null;
  const selectedDateStr = selectedDate
    ? selectedDate.toISOString().split('T')[0]
    : '';

  // Calendar navigation state (Year & Month)
  const [currentMonth, setCurrentMonth] = useState(() => (selectedDate || new Date()).getMonth());
  const [currentYear, setCurrentYear] = useState(() => (selectedDate || new Date()).getFullYear());

  useEffect(() => {
    if (value) {
      const d = parseDate(value);
      setCurrentMonth(d.getMonth());
      setCurrentYear(d.getFullYear());
    }
  }, [value]);

  // Reset view mode when opening
  useEffect(() => {
    if (isOpen) {
      setViewMode('days');
    }
  }, [isOpen]);

  const handleDateClick = (year: number, month: number, day: number) => {
    if (disabled) return;
    const mStr = String(month + 1).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    const formatted = `${year}-${mStr}-${dStr}`;

    setIsOpen(false);
    if (onChange) {
      onChange({ target: { value: formatted }, value: formatted });
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    if (onChange) {
      onChange({ target: { value: '' }, value: '' });
    }
  };

  const handleSelectToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    const today = new Date();
    handleDateClick(today.getFullYear(), today.getMonth(), today.getDate());
  };

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMode === 'years') {
      setCurrentYear((y) => y - 12);
    } else if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMode === 'years') {
      setCurrentYear((y) => y + 12);
    } else if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Days grid generator
  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfWeek = (y: number, m: number) => new Date(y, m, 1).getDay();

  const daysInCurrentMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfWeek = getFirstDayOfWeek(currentYear, currentMonth);

  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

  const calendarDays = [];

  // Previous month days
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    calendarDays.push({
      day: daysInPrevMonth - i,
      month: prevMonth,
      year: prevYear,
      isCurrentMonth: false
    });
  }

  // Current month days
  for (let d = 1; d <= daysInCurrentMonth; d++) {
    calendarDays.push({
      day: d,
      month: currentMonth,
      year: currentYear,
      isCurrentMonth: true
    });
  }

  // Next month leading days (fill 42 slots)
  const remainingCells = 42 - calendarDays.length;
  const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
  const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;

  for (let d = 1; d <= remainingCells; d++) {
    calendarDays.push({
      day: d,
      month: nextMonth,
      year: nextYear,
      isCurrentMonth: false
    });
  }

  // Trigger button display text
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  let displayLabel = placeholder;
  if (selectedDateStr) {
    const formattedDateStr = formatDateDisplay(selectedDateStr);
    if (selectedDateStr === todayStr) {
      displayLabel = `Today (${formattedDateStr})`;
    } else if (selectedDateStr === tomorrowStr) {
      displayLabel = `Tomorrow (${formattedDateStr})`;
    } else {
      displayLabel = formattedDateStr;
    }
  }

  // Styling sizes
  const sizeClasses: Record<string, string> = {
    xs: 'px-2.5 py-1 text-[10px] gap-1.5 rounded-lg',
    sm: 'px-3 py-1.5 text-xs gap-2 rounded-xl',
    md: 'px-3.5 py-2 text-xs font-semibold gap-2.5 rounded-xl'
  };

  const iconSizes: Record<string, string> = {
    xs: 'h-3 w-3',
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4'
  };

  return (
    <div className={`relative inline-block text-left select-none ${fullWidth ? 'w-full' : ''} ${className}`}>
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        className={`flex items-center justify-between bg-theme-surface hover:bg-theme-card-hover text-theme-main border border-theme-border font-medium transition-all duration-200 outline-none cursor-pointer focus:ring-2 focus:ring-theme-accent/40 ${
          sizeClasses[size] || sizeClasses.sm
        } ${fullWidth ? 'w-full' : ''} ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${isOpen ? 'ring-2 ring-theme-accent/50 border-theme-accent scale-[0.99]' : ''}`}
      >
        <div className="flex items-center justify-center gap-2 truncate flex-1 text-center">
          <CalendarDays className={`${iconSizes[size] || iconSizes.sm} text-theme-accent shrink-0`} />
          <span className="truncate font-semibold">{displayLabel}</span>
        </div>

        <ChevronDown
          className={`${iconSizes[size] || iconSizes.sm} shrink-0 opacity-70 transition-transform duration-200 ${
            isOpen ? 'rotate-180 opacity-100 text-theme-accent' : ''
          }`}
        />
      </button>

      {/* Premium Dark Mode Calendar Popup via React Portal */}
      {isOpen && isPositioned && createPortal(
        <div
          ref={popupRef}
          className="fixed z-[9999999] w-72 p-4 rounded-2xl bg-theme-card/98 backdrop-blur-2xl border border-theme-border shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-theme-main"
          style={{
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            transformOrigin: `${coords.openUpward ? 'bottom' : 'top'} left`
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Navigation */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-theme-border">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-theme-muted hover:text-theme-main hover:bg-theme-card-hover transition cursor-pointer"
              title="Previous"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Clickable Month / Year title to toggle Month/Year picker view */}
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setViewMode(viewMode === 'months' ? 'days' : 'months')}
                className="text-xs font-extrabold text-theme-main hover:text-theme-accent px-1.5 py-0.5 rounded-md hover:bg-theme-card-hover transition cursor-pointer flex items-center gap-1"
              >
                <span>{MONTH_NAMES_FULL[currentMonth]}</span>
                <ChevronDown className={`h-3 w-3 opacity-60 ${viewMode === 'months' ? 'rotate-180 text-theme-accent' : ''}`} />
              </button>

              <button
                type="button"
                onClick={() => setViewMode(viewMode === 'years' ? 'days' : 'years')}
                className="text-xs font-extrabold text-theme-main hover:text-theme-accent px-1.5 py-0.5 rounded-md hover:bg-theme-card-hover transition cursor-pointer flex items-center gap-1"
              >
                <span>{currentYear}</span>
                <ChevronDown className={`h-3 w-3 opacity-60 ${viewMode === 'years' ? 'rotate-180 text-theme-accent' : ''}`} />
              </button>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-theme-muted hover:text-theme-main hover:bg-theme-card-hover transition cursor-pointer"
              title="Next"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Body Content based on View Mode */}
          {viewMode === 'months' ? (
            /* Month Picker Grid */
            <div className="grid grid-cols-3 gap-2 py-2">
              {MONTH_NAMES_SHORT.map((mName, idx) => (
                <button
                  key={mName}
                  type="button"
                  onClick={() => {
                    setCurrentMonth(idx);
                    setViewMode('days');
                  }}
                  className={`py-2 text-xs font-extrabold rounded-xl transition cursor-pointer ${
                    currentMonth === idx
                      ? 'bg-theme-accent text-white shadow-sm'
                      : 'bg-theme-surface text-theme-main hover:bg-theme-card-hover hover:text-theme-accent border border-theme-border'
                  }`}
                >
                  {mName}
                </button>
              ))}
            </div>
          ) : viewMode === 'years' ? (
            /* Year Picker Grid */
            <div className="grid grid-cols-3 gap-2 py-2">
              {Array.from({ length: 12 }, (_, i) => currentYear - 5 + i).map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => {
                    setCurrentYear(y);
                    setViewMode('days');
                  }}
                  className={`py-2 text-xs font-extrabold rounded-xl transition cursor-pointer ${
                    currentYear === y
                      ? 'bg-theme-accent text-white shadow-sm'
                      : 'bg-theme-surface text-theme-main hover:bg-theme-card-hover hover:text-theme-accent border border-theme-border'
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
          ) : (
            /* Standard Days View */
            <>
              {/* Day Headers */}
              <div className="grid grid-cols-7 text-center mb-1">
                {DAYS_OF_WEEK.map((day) => (
                  <span key={day} className="text-[10px] font-extrabold text-theme-muted uppercase py-1">
                    {day}
                  </span>
                ))}
              </div>

              {/* Day Grid */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {calendarDays.map((cell, index) => {
                  const mStr = String(cell.month + 1).padStart(2, '0');
                  const dStr = String(cell.day).padStart(2, '0');
                  const cellDateStr = `${cell.year}-${mStr}-${dStr}`;

                  const isSelected = cellDateStr === selectedDateStr;
                  const isTodayCell = cellDateStr === todayStr;

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleDateClick(cell.year, cell.month, cell.day)}
                      className={`h-7 w-7 mx-auto flex items-center justify-center rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? 'bg-theme-accent text-white font-black shadow-md scale-105'
                          : isTodayCell
                          ? 'border border-theme-accent text-theme-accent font-extrabold bg-theme-accent/10'
                          : cell.isCurrentMonth
                          ? 'text-theme-main hover:bg-theme-card-hover hover:text-theme-accent'
                          : 'text-theme-muted/30 hover:text-theme-muted'
                      }`}
                    >
                      {cell.day}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Footer Bar: Clear and Today buttons (matching native calendar footer) */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-theme-border text-xs font-bold">
            <button
              type="button"
              onClick={handleClear}
              className="text-theme-muted hover:text-rose-400 transition cursor-pointer py-1 px-2 rounded-lg hover:bg-rose-500/10"
            >
              Clear
            </button>

            <button
              type="button"
              onClick={handleSelectToday}
              className="text-theme-accent hover:text-theme-accent-hover transition cursor-pointer py-1 px-2.5 rounded-lg hover:bg-theme-accent/10"
            >
              Today
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default CustomDatePicker;

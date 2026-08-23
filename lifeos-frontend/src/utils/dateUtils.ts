const MONTH_NAMES_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Formats a date string (YYYY-MM-DD or ISO string or Date object) into DD-MMM-YYYY format
 * Example: "2026-08-18" -> "18-Aug-2026"
 * Example: "2026-09-01" -> "01-Sep-2026"
 */
export const formatDateDisplay = (dateInput?: string | Date | null): string => {
  if (!dateInput) return '';

  let d: Date;
  if (dateInput instanceof Date) {
    d = dateInput;
  } else if (typeof dateInput === 'string') {
    // Check if format is YYYY-MM-DD
    const parts = dateInput.split('T')[0].split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day) && month >= 0 && month < 12) {
        const dayStr = String(day).padStart(2, '0');
        const monthStr = MONTH_NAMES_SHORT[month];
        return `${dayStr}-${monthStr}-${year}`;
      }
    }
    d = new Date(dateInput);
  } else {
    return String(dateInput);
  }

  if (isNaN(d.getTime())) return String(dateInput);

  const dayStr = String(d.getDate()).padStart(2, '0');
  const monthStr = MONTH_NAMES_SHORT[d.getMonth()] || 'Jan';
  const yearStr = d.getFullYear();

  return `${dayStr}-${monthStr}-${yearStr}`;
};

/**
 * Gets today's date formatted as DD-MMM-YYYY (e.g. 18-Aug-2026)
 */
export const getTodayFormatted = (): string => {
  return formatDateDisplay(new Date());
};

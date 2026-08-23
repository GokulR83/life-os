/**
 * Utility to calculate consecutive habit and user streaks based on completion dates.
 */
export const calculateStreakFromDates = (dates: string[] = []): number => {
  if (!dates || dates.length === 0) return 0;

  const normalizedDates = new Set(
    dates.map((d) => (typeof d === 'string' ? d.split('T')[0] : '')).filter(Boolean)
  );

  if (normalizedDates.size === 0) return 0;

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const yesterday = new Date(now);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let checkDate: Date;
  if (normalizedDates.has(todayStr)) {
    checkDate = new Date(todayStr + 'T00:00:00Z');
  } else if (normalizedDates.has(yesterdayStr)) {
    checkDate = new Date(yesterdayStr + 'T00:00:00Z');
  } else {
    return 0;
  }

  let streak = 0;
  const curr = new Date(checkDate);
  while (true) {
    const dStr = curr.toISOString().split('T')[0];
    if (normalizedDates.has(dStr)) {
      streak++;
      curr.setUTCDate(curr.getUTCDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};

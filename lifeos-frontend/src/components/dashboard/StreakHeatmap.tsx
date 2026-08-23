import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { CustomSelect } from '../common/CustomSelect';
import { Trophy, Flame, TrendingUp } from 'lucide-react';

export const StreakHeatmap = () => {
  const navigate = useNavigate();
  const { heatmap = [], user } = useData();
  const [selectedYear, setSelectedYear] = useState('2026');

  const availableYears = ['2026', '2025', '2024'];

  const heatmapList = heatmap || [];

  // Filter data by selected year
  const yearData = heatmapList.filter((item: any) => item?.date && item.date.startsWith(selectedYear));

  // Compute total contributions and active days
  const totalSubmissions = yearData.reduce((sum: number, item: any) => sum + (item.count || 0), 0);
  const activeDaysCount = yearData.filter((item: any) => (item.count || 0) > 0).length;

  // Group days into all 12 Month Blocks (Jan - Dec) with exact day counts
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const monthsData = monthNames.map((mName, monthIdx) => {
    const totalDaysInMonth = new Date(parseInt(selectedYear), monthIdx + 1, 0).getDate();

    const daysInMonthMap: Record<number, any> = {};
    yearData.forEach((item: any) => {
      const d = new Date(item.date);
      if (d.getFullYear() === parseInt(selectedYear) && d.getMonth() === monthIdx) {
        daysInMonthMap[d.getDate()] = item;
      }
    });

    const firstDate = new Date(parseInt(selectedYear), monthIdx, 1);
    const startDay = firstDate.getDay();

    const monthWeeks = [];
    let currentWeek = [];

    for (let i = 0; i < startDay; i++) {
      currentWeek.push(null);
    }

    for (let dayNum = 1; dayNum <= totalDaysInMonth; dayNum++) {
      const dayItem = daysInMonthMap[dayNum] || {
        date: `${selectedYear}-${String(monthIdx + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`,
        count: 0,
        level: 0,
        tasksDone: 0,
        studyHours: 0
      };

      currentWeek.push(dayItem);
      if (currentWeek.length === 7) {
        monthWeeks.push(currentWeek);
        currentWeek = [];
      }
    }

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      monthWeeks.push(currentWeek);
    }

    return {
      name: mName,
      weeks: monthWeeks,
      totalCount: Object.values(daysInMonthMap).reduce((sum, d) => sum + (d.count || 0), 0)
    };
  });

  const getColorClass = (level) => {
    if (level === 0 || level === null || level === undefined) {
      return 'bg-theme-card-hover/80 border-theme-border/60 text-transparent';
    }
    if (level === 1) return 'bg-theme-accent-light border-theme-border text-theme-accent';
    if (level === 2) return 'bg-theme-accent/40 border-theme-accent text-white';
    if (level === 3) return 'bg-theme-accent border-theme-accent text-white font-bold';
    return 'bg-gradient-dual border-transparent text-white font-extrabold shadow-sm';
  };

  const handleDayClick = (dateStr) => {
    if (dateStr) {
      navigate(`/journal?date=${dateStr}`);
    }
  };

  return (
    <div className="p-6 rounded-3xl border border-theme-border bg-theme-card shadow-lg space-y-5">
      {/* Top Header Row (Theme-Aware Stats) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-theme-accent-light text-theme-accent border border-theme-border">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-lg font-extrabold text-theme-main tracking-tight">
                {totalSubmissions} submissions in {selectedYear}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-extrabold border border-emerald-500/20 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                <span>+14% vs last week</span>
              </span>
            </div>
            <p className="text-xs text-theme-muted flex items-center space-x-3 mt-0.5">
              <span>Total active days: <strong className="text-theme-main font-bold">{activeDaysCount}</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Flame className="h-3.5 w-3.5 text-theme-accent" />
                Streak: <strong className="text-theme-accent font-bold">{user?.streak ?? 0}d</strong> (Best: {user?.longestStreak || user?.streak || 0}d)
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Year Dropdown Selector */}
          <CustomSelect
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            options={availableYears}
            variant="default"
            size="sm"
          />

          <div className="flex items-center space-x-1.5 text-xs text-theme-muted font-semibold">
            <span>Less</span>
            <div className="flex space-x-1">
              <span className="w-3 h-3 rounded-[2.5px] bg-theme-card-hover border border-theme-border"></span>
              <span className="w-3 h-3 rounded-[2.5px] bg-theme-accent-light border border-theme-border"></span>
              <span className="w-3 h-3 rounded-[2.5px] bg-theme-accent/40 border border-theme-accent"></span>
              <span className="w-3 h-3 rounded-[2.5px] bg-theme-accent border border-theme-accent"></span>
              <span className="w-3 h-3 rounded-[2.5px] bg-gradient-dual"></span>
            </div>
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Full 12-Month Calendar Grid with Journal Click-Through */}
      <div className="p-5 rounded-2xl bg-theme-surface border border-theme-border overflow-x-auto">
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-3 md:gap-4 min-w-[700px] w-full">
          {monthsData.map((month) => (
            <div key={month.name} className="flex flex-col space-y-2 items-center">
              {/* Month Header Badge */}
              <span className="text-[11px] font-extrabold text-theme-muted text-center tracking-wider">
                {month.name}
              </span>

              {/* 7 Rows x Weeks Grid for this Month */}
              <div className="flex space-x-[3px] justify-center">
                {month.weeks.map((week, wIdx) => (
                  <div key={wIdx} className="flex flex-col space-y-[3px]">
                    {week.map((day, dIdx) => (
                      day ? (
                        <div
                          key={dIdx}
                          onClick={() => handleDayClick(day.date)}
                          title={`${day.date}: ${day.count} submissions (${day.studyHours}h study, ${day.tasksDone} tasks) • Click to open Journal`}
                          className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-[2.5px] border transition-transform hover:scale-125 cursor-pointer ${getColorClass(
                            day.level
                          )}`}
                        />
                      ) : (
                        <div key={dIdx} className="w-2.5 h-2.5 md:w-3 md:h-3 opacity-0 pointer-events-none" />
                      )
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


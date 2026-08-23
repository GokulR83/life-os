import { TaskModel } from '../models/task-model';
import { HabitModel } from '../models/habit-model';
import { DsaModel } from '../models/dsa-model';
import { StudyModel } from '../models/study-model';
import { ExpenseModel } from '../models/expense-model';
import { JobModel } from '../models/job-model';
import { FlashcardModel } from '../models/flashcard-model';
import { UserModel } from '../models/user-model';
import { calculateStreakFromDates } from '../utils/streak-util';

export const getDashboardSummaryService = async (userId: string) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7);

  const [
    user,
    totalTasks,
    completedTasks,
    pendingTasks,
    habits,
    dsaPatterns,
    studySessions,
    expenses,
    jobs,
    flashcards,
  ] = await Promise.all([
    UserModel.findById(userId).lean(),
    TaskModel.countDocuments({ userId }),
    TaskModel.countDocuments({ userId, completed: true }),
    TaskModel.countDocuments({ userId, completed: false }),
    HabitModel.find({ userId }).lean(),
    DsaModel.find({ userId }).lean(),
    StudyModel.find({ userId }).lean(),
    ExpenseModel.find({ userId }).lean(),
    JobModel.find({ userId }).lean(),
    FlashcardModel.find({ userId }).lean(),
  ]);

  // Today study hours calculation
  const todayStudySessions = studySessions.filter((s) => s.date === todayStr);
  const todayStudyMinutes = todayStudySessions.reduce(
    (sum, s) => sum + (s.durationMinutes || s.duration || 0),
    0
  );
  const todayStudyHours = parseFloat((todayStudyMinutes / 60).toFixed(1));

  // Daily study goal
  const dailyStudyGoalHours = user?.dailyStudyGoalHours || 4;
  const studyPct = Math.min(100, Math.round((todayStudyHours / Math.max(dailyStudyGoalHours, 1)) * 100));

  // Task metrics
  const taskPct = Math.round(((completedTasks || 0) / Math.max(totalTasks || 1, 1)) * 100);

  // User streak metrics
  const habitStreaks = habits.map((h) => calculateStreakFromDates(h.completedDates || h.completionLog || []));
  const maxHabitStreak = habitStreaks.length > 0 ? Math.max(...habitStreaks, 0) : 0;
  const userStreak = Math.max(user?.streak || 0, maxHabitStreak);
  const longestStreak = Math.max(user?.longestStreak || 0, userStreak);
  const streakPct = longestStreak > 0 ? Math.min(100, Math.round((userStreak / longestStreak) * 100)) : 0;

  // Compute Overall Daily Velocity Score
  const velocityScore = Math.round(studyPct * 0.4 + taskPct * 0.4 + streakPct * 0.2);

  // Total Study Hours
  const totalStudyMinutes = studySessions.reduce(
    (sum, s) => sum + (s.durationMinutes || s.duration || 0),
    0
  );

  // DSA Solved
  const totalDsaSolved = dsaPatterns.reduce((sum, d) => sum + (d.solvedProblems || 0), 0);

  // Monthly Expenses Total
  const currentMonthExpenses = expenses.filter((e) => (e.date || '').startsWith(currentMonthStr));
  const totalExpensesThisMonth = currentMonthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  // Cards due today for SM-2 Spaced Repetition Flashcards
  const cardsDueToday = flashcards.filter((f) => {
    if (!f.nextReviewDate && !f.nextReview) return true;
    const reviewDate = f.nextReviewDate || f.nextReview;
    return reviewDate! <= todayStr;
  });

  return {
    velocityScore,
    todayStudyHours,
    dailyStudyGoalHours,
    studyPct,
    totalTasks,
    completedTasks,
    pendingTasks,
    taskPct,
    userStreak,
    longestStreak: userStreak,
    habitsStreakCurrent: maxHabitStreak,
    dsaProblemsSolved: totalDsaSolved,
    studyHoursTotal: parseFloat((totalStudyMinutes / 60).toFixed(1)),
    totalExpensesThisMonth,
    cardsDueTodayCount: cardsDueToday.length,
    totalJobApplications: jobs.length,
    activeJobInterviews: jobs.filter((j) => ['OA', 'Interview', 'Interviewing'].includes(j.status)).length,
  };
};

export const getHeatmapDataService = async (userId: string) => {
  // Aggregate study sessions, completed tasks, habits, and DSA submissions into heatmap activity counts
  const [studySessions, tasks, habits, dsaPatterns] = await Promise.all([
    StudyModel.find({ userId }).lean(),
    TaskModel.find({ userId, completed: true }).lean(),
    HabitModel.find({ userId }).lean(),
    DsaModel.find({ userId }).lean(),
  ]);

  const activityMap: Record<string, number> = {};

  // 1. Study Sessions
  studySessions.forEach((s) => {
    if (s.date) {
      activityMap[s.date] = (activityMap[s.date] || 0) + 2;
    }
  });

  // 2. Completed Tasks
  tasks.forEach((t: any) => {
    const dStr = t.completedAt ? new Date(t.completedAt).toISOString().split('T')[0] : (t.dueDate || t.deadline);
    if (dStr) {
      activityMap[dStr] = (activityMap[dStr] || 0) + 1;
    }
  });

  // 3. Habit logs
  habits.forEach((h: any) => {
    const logs = h.completionLog || h.completedDates || [];
    logs.forEach((d: string) => {
      activityMap[d] = (activityMap[d] || 0) + 1;
    });
  });

  // 4. DSA Submissions
  dsaPatterns.forEach((d: any) => {
    if (d.updatedAt) {
      const dStr = new Date(d.updatedAt).toISOString().split('T')[0];
      activityMap[dStr] = (activityMap[dStr] || 0) + 1;
    }
  });

  const getIntensityLevel = (count: number) => {
    if (!count || count <= 0) return 0;
    if (count <= 2) return 1;
    if (count <= 4) return 2;
    if (count <= 6) return 3;
    return 4;
  };

  const activities = Object.entries(activityMap).map(([date, count]) => ({
    date,
    count,
    level: getIntensityLevel(count),
  }));

  return { activities };
};

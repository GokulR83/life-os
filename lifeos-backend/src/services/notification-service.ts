import { TaskModel } from '../models/task-model';
import { FlashcardModel } from '../models/flashcard-model';
import { JobModel } from '../models/job-model';
import { UserModel } from '../models/user-model';
import { ExpenseModel } from '../models/expense-model';

// Store user read notification IDs in memory per user session
const readNotificationMap: Record<string, string[]> = {};

export const getNotificationsService = async (userId?: string) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7);

  const notifications: any[] = [];
  const readIds = userId ? readNotificationMap[userId] || [] : [];

  try {
    // 1. Overdue Tasks
    const overdueTasks = await TaskModel.find({
      ...(userId ? { userId } : {}),
      completed: false,
      dueDate: { $lt: todayStr },
    }).lean();

    overdueTasks.forEach((t: any) => {
      notifications.push({
        id: `task_${t._id || t.id}`,
        title: 'Task Overdue Warning',
        message: `Task "${t.title}" is overdue (${t.dueDate || 'past deadline'}).`,
        timestamp: 'Today',
        type: 'task',
        link: '/planner',
        icon: 'AlertCircle',
        color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
      });
    });

    // 2. SM-2 Flashcards Due Today
    const dueCardsCount = await FlashcardModel.countDocuments({
      ...(userId ? { userId } : {}),
      $or: [
        { nextReviewDate: { $lte: todayStr } },
        { nextReview: { $lte: todayStr } },
        { nextReviewDate: { $exists: false } },
      ],
    });

    if (dueCardsCount > 0) {
      notifications.push({
        id: `cards_due_${todayStr}`,
        title: 'DSA Review Ready (SM-2)',
        message: `${dueCardsCount} flashcard(s) due today for SM-2 spaced repetition review.`,
        timestamp: 'Today',
        type: 'study',
        link: '/dsa',
        icon: 'Brain',
        color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
      });
    }

    // 3. Active Job Applications (OA & Interview)
    const activeJobs = await JobModel.find({
      ...(userId ? { userId } : {}),
      status: { $in: ['OA', 'Interview', 'Interviewing'] },
    }).lean();

    activeJobs.forEach((j: any) => {
      notifications.push({
        id: `job_${j._id || j.id}`,
        title: 'Job Application Milestone',
        message: `${j.company || 'Company'} - ${j.role || j.position || 'Role'} is in ${j.status} stage.`,
        timestamp: 'Active',
        type: 'career',
        link: '/job-search',
        icon: 'Briefcase',
        color: 'text-sky-500 bg-sky-500/10 border-sky-500/20',
      });
    });

    // 4. User Streak Milestone
    if (userId) {
      const user = await UserModel.findById(userId).lean();
      if (user && (user as any).streak > 0) {
        notifications.push({
          id: `streak_${(user as any).streak}`,
          title: 'Streak Active!',
          message: `You are maintaining a ${(user as any).streak}-day coding & study streak!`,
          timestamp: 'Ongoing',
          type: 'streak',
          link: '/dashboard',
          icon: 'Flame',
          color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        });
      }
    }

    // 5. Monthly Expenses Summary
    const thisMonthExpenses = await ExpenseModel.find({
      ...(userId ? { userId } : {}),
      date: { $regex: `^${currentMonthStr}` },
    }).lean();

    const totalSpend = thisMonthExpenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
    if (totalSpend > 0) {
      notifications.push({
        id: `expense_${currentMonthStr}`,
        title: 'Monthly Expense Log',
        message: `Total spend recorded for ${currentMonthStr}: ₹${totalSpend.toLocaleString('en-IN')}`,
        timestamp: 'This Month',
        type: 'expense',
        link: '/trackers',
        icon: 'DollarSign',
        color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      });
    }

    return notifications.map((n) => ({
      ...n,
      unread: !readIds.includes(n.id),
    }));
  } catch (err) {
    console.error('[NOTIFICATION_SERVICE] Error generating notifications:', err);
    return [];
  }
};

export const markAllNotificationsReadService = async (userId?: string, notificationIds?: string[]) => {
  if (!userId) return { success: true };
  const currentRead = readNotificationMap[userId] || [];
  if (notificationIds && notificationIds.length > 0) {
    readNotificationMap[userId] = Array.from(new Set([...currentRead, ...notificationIds]));
  } else {
    const all = await getNotificationsService(userId);
    readNotificationMap[userId] = all.map((n) => n.id);
  }
  return { success: true };
};

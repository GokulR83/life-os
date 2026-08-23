import mongoose from 'mongoose';
import { HabitModel } from '../models/habit-model';
import { UserModel } from '../models/user-model';
import { IHabit } from '../types/habit-types';
import { NotFoundError, BadRequestError } from '../utils/app-error-util';
import { calculateStreakFromDates } from '../utils/streak-util';

export const getAllHabitsService = async (userId: string, query: any) => {
  const page = parseInt(query.page || '1', 10);
  const limit = parseInt(query.limit || '100', 10);
  const skip = (page - 1) * limit;

  const filter: any = { userId };
  if (query.category) filter.category = query.category;

  const [habits, total] = await Promise.all([
    HabitModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    HabitModel.countDocuments(filter),
  ]);

  const todayStr = new Date().toISOString().split('T')[0];

  const sanitizedHabits = habits.map((h) => {
    const obj = h.toObject();
    const dates = obj.completedDates || obj.completionLog || [];
    const calculatedStreak = calculateStreakFromDates(dates);
    const completedToday = dates.includes(todayStr);
    return {
      ...obj,
      _id: h._id.toString(),
      id: h._id.toString(),
      streak: calculatedStreak,
      completedToday,
      completedDates: dates,
      completionLog: dates,
    };
  });

  return { habits: sanitizedHabits, page, limit, total };
};

export const createHabitService = async (userId: string, payload: Partial<IHabit>): Promise<IHabit> => {
  const name = payload.name || payload.title;
  if (!name) {
    throw new BadRequestError('Habit name is required.');
  }

  const dates = payload.completedDates || payload.completionLog || [];
  const streak = calculateStreakFromDates(dates);
  const todayStr = new Date().toISOString().split('T')[0];

  const newHabit = await HabitModel.create({
    ...payload,
    name,
    title: name,
    userId,
    streak,
    completedToday: dates.includes(todayStr),
    completionLog: dates,
    completedDates: dates,
  });

  // Sync overall user streak in UserModel
  const allUserHabits = await HabitModel.find({ userId });
  const allStreaks = allUserHabits.map((h) => calculateStreakFromDates(h.completedDates || h.completionLog || []));
  const maxHabitStreak = allStreaks.length > 0 ? Math.max(...allStreaks, 0) : 0;
  const user = await UserModel.findById(userId);
  if (user) {
    const newLongest = Math.max(user.longestStreak || 0, maxHabitStreak);
    await UserModel.findByIdAndUpdate(userId, {
      streak: maxHabitStreak,
      longestStreak: newLongest,
    });
  }

  const obj = newHabit.toObject();
  return { ...obj, _id: newHabit._id.toString(), id: newHabit._id.toString(), streak, completedToday: dates.includes(todayStr) };
};

export const getHabitByIdService = async (userId: string, id: string): Promise<IHabit> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new NotFoundError(`Habit not found with ID: ${id}`);
  }
  const habit = await HabitModel.findOne({ _id: id, userId });
  if (!habit) {
    throw new NotFoundError(`Habit not found with ID: ${id}`);
  }

  const obj = habit.toObject();
  const dates = obj.completedDates || obj.completionLog || [];
  const todayStr = new Date().toISOString().split('T')[0];
  const calculatedStreak = calculateStreakFromDates(dates);

  return {
    ...obj,
    _id: habit._id.toString(),
    id: habit._id.toString(),
    streak: calculatedStreak,
    completedToday: dates.includes(todayStr),
    completedDates: dates,
    completionLog: dates,
  };
};

export const updateHabitService = async (userId: string, id: string, payload: Partial<IHabit>): Promise<IHabit> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new NotFoundError(`Habit not found with ID: ${id}`);
  }

  const updateData: any = { ...payload };
  if (payload.completedDates || payload.completionLog) {
    const dates = payload.completedDates || payload.completionLog || [];
    updateData.completedDates = dates;
    updateData.completionLog = dates;
    updateData.streak = calculateStreakFromDates(dates);
    const todayStr = new Date().toISOString().split('T')[0];
    updateData.completedToday = dates.includes(todayStr);
  }

  const habit = await HabitModel.findOneAndUpdate({ _id: id, userId }, updateData, {
    new: true,
    runValidators: true,
  });

  if (!habit) {
    throw new NotFoundError(`Habit not found with ID: ${id}`);
  }

  // Recalculate max habit streak
  const allUserHabits = await HabitModel.find({ userId });
  const allStreaks = allUserHabits.map((h) => calculateStreakFromDates(h.completedDates || h.completionLog || []));
  const maxHabitStreak = allStreaks.length > 0 ? Math.max(...allStreaks, 0) : 0;
  const user = await UserModel.findById(userId);
  if (user) {
    const newLongest = Math.max(user.longestStreak || 0, maxHabitStreak);
    await UserModel.findByIdAndUpdate(userId, {
      streak: maxHabitStreak,
      longestStreak: newLongest,
    });
  }

  const obj = habit.toObject();
  return { ...obj, _id: habit._id.toString(), id: habit._id.toString() };
};

export const toggleHabitService = async (userId: string, id: string, dateStr?: string): Promise<IHabit> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new NotFoundError(`Habit not found with ID: ${id}`);
  }
  const habit = await HabitModel.findOne({ _id: id, userId });
  if (!habit) {
    throw new NotFoundError(`Habit not found with ID: ${id}`);
  }

  const targetDate = dateStr || new Date().toISOString().split('T')[0];
  const log = habit.completionLog || habit.completedDates || [];
  const hasCompletedTarget = log.includes(targetDate);

  let newLog: string[];
  if (hasCompletedTarget) {
    newLog = log.filter((d) => d !== targetDate);
  } else {
    newLog = [...log, targetDate];
  }

  const newStreak = calculateStreakFromDates(newLog);
  const todayStr = new Date().toISOString().split('T')[0];
  const completedToday = newLog.includes(todayStr);

  habit.completionLog = newLog;
  habit.completedDates = newLog;
  habit.completedToday = completedToday;
  habit.streak = newStreak;

  await habit.save();

  // Sync overall user streak in UserModel to highest habit streak
  const allUserHabits = await HabitModel.find({ userId });
  const allStreaks = allUserHabits.map((h) =>
    h._id.toString() === id ? newStreak : calculateStreakFromDates(h.completedDates || h.completionLog || [])
  );
  const maxHabitStreak = allStreaks.length > 0 ? Math.max(...allStreaks, 0) : 0;
  const user = await UserModel.findById(userId);
  if (user) {
    const newLongest = Math.max(user.longestStreak || 0, maxHabitStreak);
    await UserModel.findByIdAndUpdate(userId, {
      streak: maxHabitStreak,
      longestStreak: newLongest,
    });
  }

  const obj = habit.toObject();
  return {
    ...obj,
    _id: habit._id.toString(),
    id: habit._id.toString(),
    streak: newStreak,
    completedToday,
    completedDates: newLog,
    completionLog: newLog,
  };
};

export const deleteHabitService = async (userId: string, id: string): Promise<void> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new NotFoundError(`Habit not found with ID: ${id}`);
  }
  const habit = await HabitModel.findOneAndDelete({ _id: id, userId });
  if (!habit) {
    throw new NotFoundError(`Habit not found with ID: ${id}`);
  }

  // Recalculate max habit streak after deletion
  const allUserHabits = await HabitModel.find({ userId });
  const allStreaks = allUserHabits.map((h) => calculateStreakFromDates(h.completedDates || h.completionLog || []));
  const maxHabitStreak = allStreaks.length > 0 ? Math.max(...allStreaks, 0) : 0;
  await UserModel.findByIdAndUpdate(userId, { streak: maxHabitStreak });
};

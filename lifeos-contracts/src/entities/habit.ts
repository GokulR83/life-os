export interface IHabit {
  _id?: string;
  id?: string;
  userId?: string;
  name?: string;
  title?: string;
  category?: string;
  frequency?: string;
  streak?: number;
  targetDays?: number;
  completedToday?: boolean;
  completedDates?: string[];
  completionLog?: string[];
  color?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateHabitDTO {
  name?: string;
  title?: string;
  category?: string;
  frequency?: string;
  targetDays?: number;
  completedDates?: string[];
  color?: string;
}

export type UpdateHabitDTO = Partial<CreateHabitDTO>;

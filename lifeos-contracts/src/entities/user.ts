export type UserRole = 'ADMIN' | 'USER';

export interface IUserNotificationSettings {
  dailyReminder?: boolean;
  streakWarning?: boolean;
  jobFollowUps?: boolean;
}

export interface IUser {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  username?: string;
  password?: string;
  role?: UserRole;
  profession?: string;
  title?: string;
  workingStatus?: string;
  avatar?: string;
  bio?: string;
  dailyStudyGoalHours?: number;
  dailyDSAGoal?: number;
  streak?: number;
  longestStreak?: number;
  theme?: 'dark' | 'light' | 'emerald' | 'amber' | 'slate' | string;
  isActive?: boolean;
  notifications?: IUserNotificationSettings;
  createdAt?: string;
  updatedAt?: string;
}

export interface IAuthResponseData {
  user: IUser;
  token: string;
}

export interface ILoginPayload {
  email: string;
  password?: string;
}

export interface ISignUpPayload {
  name: string;
  email: string;
  username?: string;
  password?: string;
  role?: string;
  profession?: string;
  avatar?: string;
  theme?: string;
}

export type ICreateUserPayload = ISignUpPayload;

export interface UpdateProfileDTO {
  name?: string;
  profession?: string;
  avatar?: string;
  bio?: string;
  dailyStudyGoalHours?: number;
  dailyDSAGoal?: number;
  theme?: string;
  currentPassword?: string;
  newPassword?: string;
}

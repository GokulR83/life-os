import { UserModel } from '../models/user-model';
import { HabitModel } from '../models/habit-model';
import { ICreateUserPayload, ILoginPayload, IAuthResponseData, IUser } from '../types/user-types';
import { BadRequestError, ConflictError, NotFoundError, UnauthorizedError } from '../utils/app-error-util';
import { signToken } from '../utils/jwt-util';
import { calculateStreakFromDates } from '../utils/streak-util';

export const registerUserService = async (payload: ICreateUserPayload): Promise<IAuthResponseData> => {
  const { name, email, username, password, role, avatar, theme } = payload;

  if (!name || !email || !password) {
    throw new BadRequestError('Name, email, and password are required.');
  }

  const cleanEmail = email.trim().toLowerCase();

  const existingUser = await UserModel.findOne({ email: cleanEmail });
  if (existingUser) {
    throw new ConflictError('A user with this email address already exists.');
  }

  let finalUsername = username ? username.trim().toLowerCase() : cleanEmail.split('@')[0].toLowerCase();
  const existingUsername = await UserModel.findOne({ username: finalUsername });
  if (existingUsername) {
    if (username) {
      throw new ConflictError('A user with this username already exists.');
    } else {
      finalUsername = `${finalUsername}_${Math.floor(1000 + Math.random() * 9000)}`;
    }
  }

  const newUser = await UserModel.create({
    name,
    email: cleanEmail,
    username: finalUsername,
    password,
    role: role || 'USER',
    avatar,
    theme: theme || 'dark',
  });

  const token = signToken({
    id: newUser._id.toString(),
    role: newUser.role,
    email: newUser.email,
  });

  const formattedUser = await formatUserResponse(newUser);

  return {
    user: formattedUser,
    token,
  };
};

async function formatUserResponse(userDoc: any): Promise<Omit<IUser, 'password'>> {
  const userId = userDoc._id.toString();
  const userHabits = await HabitModel.find({ userId });
  const maxHabitStreak =
    userHabits.length > 0
      ? Math.max(...userHabits.map((h) => calculateStreakFromDates(h.completedDates || h.completionLog || [])), 0)
      : 0;
  const streak = maxHabitStreak > 0 ? maxHabitStreak : (userDoc.streak ?? 0);
  const longestStreak = Math.max(userDoc.longestStreak ?? 0, streak);

  const userResponse = userDoc.toObject ? userDoc.toObject() : { ...userDoc };
  delete userResponse.password;
  return {
    ...userResponse,
    _id: userId,
    streak,
    longestStreak,
  };
}

export const loginUserService = async (payload: ILoginPayload): Promise<IAuthResponseData> => {
  const { email, password } = payload;

  if (!email || !password) {
    throw new BadRequestError('Please provide email and password.');
  }

  const cleanIdentifier = email.trim().toLowerCase();

  const user = await UserModel.findOne({
    $or: [{ email: cleanIdentifier }, { username: cleanIdentifier }]
  }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw new UnauthorizedError('Invalid email or password.');
  }

  if (!user.isActive) {
    throw new UnauthorizedError('Your user account has been deactivated.');
  }

  const token = signToken({
    id: user._id.toString(),
    role: user.role,
    email: user.email,
  });

  const formattedUser = await formatUserResponse(user);

  return {
    user: formattedUser,
    token,
  };
};

export const getMeService = async (userId: string): Promise<Omit<IUser, 'password'>> => {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new NotFoundError('User profile not found.');
  }

  return await formatUserResponse(user);
};

export const updateProfileService = async (userId: string, payload: any): Promise<Omit<IUser, 'password'>> => {
  const user = await UserModel.findById(userId).select('+password');
  if (!user) {
    throw new NotFoundError('User profile not found.');
  }

  // NOTE: Email is read-only and cannot be changed via profile update.

  // Username update check
  if (payload.username && payload.username.trim().toLowerCase() !== user.username) {
    const cleanUsername = payload.username.trim().toLowerCase();
    const existing = await UserModel.findOne({ username: cleanUsername });
    if (existing && existing._id.toString() !== userId) {
      throw new ConflictError('This username is already taken. Please choose another.');
    }
    user.username = cleanUsername;
  }

  if (payload.name) user.name = payload.name;
  if (payload.avatar !== undefined) user.avatar = payload.avatar;
  if (payload.theme !== undefined) user.theme = payload.theme;
  if (payload.workingStatus !== undefined) user.workingStatus = payload.workingStatus;
  if (payload.streak !== undefined) user.streak = payload.streak;
  if (payload.dailyDSAGoal !== undefined) user.dailyDSAGoal = payload.dailyDSAGoal;
  if (payload.dailyStudyGoalHours !== undefined) user.dailyStudyGoalHours = payload.dailyStudyGoalHours;
  if (payload.notifications) {
    user.notifications = {
      ...user.notifications,
      ...payload.notifications,
    };
  }

  // Optional password change
  if (payload.newPassword) {
    if (!payload.currentPassword) {
      throw new BadRequestError('Current password is required to set a new password.');
    }
    const isMatch = await user.comparePassword(payload.currentPassword);
    if (!isMatch) {
      throw new UnauthorizedError('Current password provided is incorrect.');
    }
    user.password = payload.newPassword;
  }

  await user.save();

  const userResponse = user.toObject();
  delete userResponse.password;
  return {
    ...userResponse,
    _id: user._id.toString(),
  };
};

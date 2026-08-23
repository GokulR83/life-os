import { IUser, UserRole, IUserNotificationSettings, IAuthResponseData, ILoginPayload, ISignUpPayload } from '@lifeos/contracts';

export type { UserRole, IUser, IUserNotificationSettings, IAuthResponseData, ILoginPayload, ISignUpPayload };

export interface AuthContextType {
  currentUser: IUser | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  authError: string | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; user?: IUser; message?: string }>;
  demoLogin: () => Promise<{ success: boolean; user?: IUser; message?: string }>;
  register: (payload: ISignUpPayload) => Promise<{ success: boolean; user?: IUser; message?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updatedFields: Partial<IUser> & { currentPassword?: string; newPassword?: string }) => Promise<{ success: boolean; user?: IUser; message?: string }>;
}

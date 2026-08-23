import apiClient from "./apiClient";
import { IUser, IAuthResponseData, ISignUpPayload } from "../types/auth";

export const authService = {
  async login(email: string, password: string): Promise<IAuthResponseData> {
    const response: any = await apiClient.post("/auth/login", { email, password });
    return response.data as IAuthResponseData;
  },

  async register(payload: ISignUpPayload): Promise<IAuthResponseData> {
    const response: any = await apiClient.post("/auth/register", payload);
    return response.data as IAuthResponseData;
  },

  async logout(): Promise<{ success: boolean }> {
    try {
      const response: any = await apiClient.post("/auth/logout", {}, { skipToast: true, skipErrorToast: true } as any);
      return response;
    } catch (e) {
      return { success: true };
    }
  },

  async getMe(): Promise<IUser> {
    const response: any = await apiClient.get("/auth/me");
    return response.data as IUser;
  },

  async updateProfile(payload: Partial<IUser> & { currentPassword?: string; newPassword?: string }): Promise<IUser> {
    const response: any = await apiClient.put("/auth/profile", payload);
    return response.data as IUser;
  },
};

export default authService;

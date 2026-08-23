import axios, { InternalAxiosRequestConfig, AxiosResponse } from "axios";
import { useAuthStore } from "../store/useAuthStore";
import { ApiResponseFormat, ApiCustomError } from "../types/api";
import { toastBus } from "../context/ToastContext";

const API_BASE_URL: string = (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    let token: string | null = sessionStorage.getItem("lifeos_token");

    if (!token) {
      try {
        const authStoreRaw = sessionStorage.getItem("lifeos_auth_store");
        if (authStoreRaw) {
          const parsed = JSON.parse(authStoreRaw);
          token = parsed?.state?.token || null;
        }
      } catch (e) {
        // ignore parse error
      }
    }

    if (token && token !== "null" && token !== "undefined") {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: any) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response: AxiosResponse): any => {
    const resData = response.data;
    const config: any = response.config || {};

    // Auto Toast for Success Responses (only if explicitly enabled via config.showSuccessToast)
    if (resData && typeof resData === "object" && "success" in resData) {
      if (resData.message && !config.skipToast && !config.skipSuccessToast && config.showSuccessToast) {
        toastBus.success(resData.message);
      }
      return resData as ApiResponseFormat;
    }

    return {
      success: true,
      data: resData,
      statusCode: response.status,
    } as ApiResponseFormat;
  },
  (error: any) => {
    const statusCode: number = error.response?.status || 500;
    const config: any = error.config || {};
    const requestUrl: string = config.url || "";
    const isAuthEndpoint: boolean =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/register") ||
      requestUrl.includes("/auth/logout");

    // Security Eviction: Handle 401 Unauthorized globally for protected routes (excluding auth endpoints)
    if (statusCode === 401 && !isAuthEndpoint) {
      console.warn("[SECURITY INTERCEPTOR] 401 Unauthorized encountered on protected route. Cleaning session state.");
      try {
        sessionStorage.removeItem("lifeos_token");
        const store = useAuthStore.getState();
        if (store && store.isAuthenticated && typeof store.logout === "function") {
          store.logout();
        }
      } catch (e) {
        // ignore error during cleanup
      }
    }

    const serverMessage: string =
      statusCode === 401 && !isAuthEndpoint
        ? "Session expired or invalid. Please log in again."
        : error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Network error. Please check backend connection.";

    // Trigger Error Toast unless suppressed via skipToast or skipErrorToast
    if (!config.skipToast && !config.skipErrorToast) {
      toastBus.error(serverMessage);
    }

    const customError: ApiCustomError = new Error(serverMessage);
    customError.statusCode = statusCode;
    customError.status = error.response?.data?.status || "error";
    customError.raw = error.response?.data;

    return Promise.reject(customError);
  }
);

export default apiClient;

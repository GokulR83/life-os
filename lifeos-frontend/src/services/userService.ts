import apiClient from "./apiClient";

export const userService = {
  /**
   * Export full user dataset JSON backup
   */
  async exportData(): Promise<any> {
    const response: any = await apiClient.get("/users/export");
    return response.data;
  },

  /**
   * Import JSON backup dataset payload to restore database
   */
  async importData(payload: any): Promise<any> {
    const response: any = await apiClient.post("/users/import", payload);
    return response.data;
  },

  /**
   * Reset user dataset back to clean state
   */
  async resetData(): Promise<any> {
    const response: any = await apiClient.post("/users/reset");
    return response.data;
  },
};

export default userService;

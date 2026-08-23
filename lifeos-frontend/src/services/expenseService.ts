import apiClient from "./apiClient";

export interface IExpensePayload {
  description: string;
  amount: number;
  category?: string;
  date?: string;
  paymentMethod?: string;
}

export const expenseService = {
  async getAllExpenses() {
    const response: any = await apiClient.get("/expenses", { skipSuccessToast: true } as any);
    return response.data;
  },

  async createExpense(payload: IExpensePayload) {
    const response: any = await apiClient.post("/expenses", payload, { skipSuccessToast: true } as any);
    return response.data;
  },

  async updateExpense(id: string, payload: Partial<IExpensePayload>) {
    const response: any = await apiClient.put(`/expenses/${id}`, payload, { skipSuccessToast: true } as any);
    return response.data;
  },

  async deleteExpense(id: string) {
    const response: any = await apiClient.delete(`/expenses/${id}`, { skipSuccessToast: true } as any);
    return response.data;
  }
};

export default expenseService;

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { apiSdk } from '../services/apiSdk';
import { IExpense, CreateExpenseDTO } from '@lifeos/contracts';

export interface ExpenseState {
  expenses: IExpense[];
  currency: 'INR' | 'USD';
  categories: string[];
  monthlyBudgetInr: number;
  monthlyBudgetUsd: number;
  setCurrency: (currency: 'INR' | 'USD') => void;
  addCategory: (categoryName: string) => void;
  setMonthlyBudgetInr: (budget: number) => void;
  setMonthlyBudgetUsd: (budget: number) => void;
  fetchExpensesApi: (force?: boolean) => Promise<IExpense[]>;
  addExpenseApi: (expense: CreateExpenseDTO) => Promise<IExpense>;
  deleteExpenseApi: (expenseId: string) => Promise<void>;
  addExpense: (expense: CreateExpenseDTO) => Promise<IExpense>;
}

export const defaultCategories = [
  'Personal Expenses',
  'Software & Subscriptions',
  'Food & Dining',
  'Bills & Utilities',
  'Learning & Books',
  'Hosting & Infrastructure',
  'Coffee & Productivity',
  'Travel & Transport',
  'Shopping & General'
];

export const useExpenseStore = create<ExpenseState>()(
  persist(
    (set, get) => ({
      expenses: [],
      currency: 'INR',
      categories: defaultCategories,
      monthlyBudgetInr: 40000,
      monthlyBudgetUsd: 500,

      setCurrency: (currency: 'INR' | 'USD') => set({ currency }),

      addCategory: (categoryName: string) => {
        const trimmed = categoryName.trim();
        if (!trimmed) return;
        set((state) => {
          if (state.categories.includes(trimmed)) return state;
          return { categories: [...state.categories, trimmed] };
        });
      },

      setMonthlyBudgetInr: (budget: number) => set({ monthlyBudgetInr: budget }),
      setMonthlyBudgetUsd: (budget: number) => set({ monthlyBudgetUsd: budget }),

      fetchExpensesApi: async (force = false) => {
        try {
          const items = await apiSdk.expenses.getAll();
          if (Array.isArray(items)) {
            const normalized = items.map((e) => ({
              ...e,
              id: e._id || e.id,
              description: e.description || e.title || 'Expense',
              amount: typeof e.amount === 'number' ? e.amount : parseFloat(e.amount as any) || 0,
              category: e.category || 'General',
              date: e.date || (e as any).createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
              paymentMethod: e.paymentMethod || 'Credit Card',
            }));
            set({ expenses: normalized });
            return normalized;
          }
          return get().expenses || [];
        } catch (err) {
          console.warn('[EXPENSE_STORE] Fetch expenses error:', err);
          return get().expenses || [];
        }
      },

      addExpenseApi: async (expense: CreateExpenseDTO) => {
        try {
          const created = await apiSdk.expenses.create(expense);
          if (created) {
            const formatted = { ...created, id: created._id || created.id };
            set((state) => ({
              expenses: [formatted, ...(state.expenses || []).filter((e) => (e.id || e._id) !== formatted.id)],
            }));
            return formatted;
          }
        } catch (err) {
          console.warn('[EXPENSE_STORE] Create expense error:', err);
        }

        const fallbackId = `e_${Date.now()}`;
        const local: IExpense = {
          id: fallbackId,
          _id: fallbackId,
          description: expense.description,
          amount: expense.amount,
          category: expense.category || 'General',
          date: expense.date || new Date().toISOString().split('T')[0],
        };
        set((state) => ({ expenses: [local, ...(state.expenses || [])] }));
        return local;
      },

      deleteExpenseApi: async (expenseId: string) => {
        set((state) => ({
          expenses: (state.expenses || []).filter((e) => e.id !== expenseId && e._id !== expenseId),
        }));
        if (!expenseId || expenseId.startsWith('e_') || expenseId.length !== 24) return;
        try {
          await apiSdk.expenses.delete(expenseId);
        } catch (err) {
          console.warn('[EXPENSE_STORE] Delete expense error:', err);
        }
      },

      addExpense: async (expense: CreateExpenseDTO) => {
        return get().addExpenseApi(expense);
      },
    }),
    {
      name: 'lifeos_expense_storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

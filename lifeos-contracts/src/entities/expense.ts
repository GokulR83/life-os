export interface IExpense {
  _id?: string;
  id?: string;
  userId?: string;
  title?: string;
  description: string;
  amount: number;
  category: string;
  type?: 'income' | 'expense' | string;
  tags?: string[];
  date: string;
  paymentMethod?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateExpenseDTO {
  title?: string;
  description: string;
  amount: number;
  category?: string;
  date?: string;
  paymentMethod?: string;
}

export type UpdateExpenseDTO = Partial<CreateExpenseDTO>;

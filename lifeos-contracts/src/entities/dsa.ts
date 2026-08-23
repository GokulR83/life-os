export type DsaDifficulty = 'Easy' | 'Medium' | 'Hard';
export type DsaStatus = 'Todo' | 'Revision' | 'Mastered' | string;

export interface IDsaProblem {
  _id?: string;
  id?: string;
  userId?: string;
  name?: string;
  title?: string;
  pattern?: string;
  description?: string;
  solvedProblems?: number;
  totalProblems?: number;
  difficulty?: DsaDifficulty;
  status?: DsaStatus;
  icon?: string;
  lastRevisedDate?: string;
  link?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type IDsaPattern = IDsaProblem;

export interface CreateDsaDTO {
  name?: string;
  title?: string;
  pattern?: string;
  description?: string;
  solvedProblems?: number;
  totalProblems?: number;
  difficulty?: DsaDifficulty;
  status?: DsaStatus;
  icon?: string;
  lastRevisedDate?: string;
  link?: string;
  notes?: string;
}

export type UpdateDsaDTO = Partial<CreateDsaDTO>;

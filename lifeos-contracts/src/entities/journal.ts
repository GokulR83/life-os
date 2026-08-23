export interface IJournalEntry {
  _id?: string;
  id?: string;
  userId?: string;
  date: string;
  title: string;
  entry?: string;
  content?: string;
  reflection?: string;
  highlight?: string;
  mood?: string;
  moodLabel?: string;
  energyLevel?: number;
  wins?: string[];
  keyWins?: string[];
  blockers?: string[];
  challenges?: string[];
  gratitude?: string[];
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateJournalDTO {
  date?: string;
  title: string;
  entry?: string;
  content?: string;
  reflection?: string;
  highlight?: string;
  mood?: string;
  moodLabel?: string;
  wins?: string[];
  keyWins?: string[];
  blockers?: string[];
  challenges?: string[];
}

export type UpdateJournalDTO = Partial<CreateJournalDTO>;

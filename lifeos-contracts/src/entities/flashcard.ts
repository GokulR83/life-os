export interface IFlashcard {
  _id?: string;
  id?: string;
  userId?: string;
  question?: string;
  answer?: string;
  front?: string;
  back?: string;
  pattern?: string;
  category?: string;
  deck?: string;
  difficulty?: string;
  codeSnippet?: string;
  explanation?: string;
  easeFactor?: number;
  efactor?: number;
  interval?: number;
  repetitions?: number;
  repetition?: number;
  needsRevision?: boolean;
  isAiGenerated?: boolean;
  noteId?: string;
  lastReviewed?: string;
  nextReviewDate?: string;
  nextReview?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateFlashcardDTO {
  question?: string;
  answer?: string;
  front?: string;
  back?: string;
  pattern?: string;
  category?: string;
  deck?: string;
  difficulty?: string;
  codeSnippet?: string;
  explanation?: string;
  needsRevision?: boolean;
}

export interface GenerateAiFlashcardDTO {
  noteId?: string;
  noteContent?: string;
  topic?: string;
  pattern?: string;
}

export type UpdateFlashcardDTO = Partial<CreateFlashcardDTO>;

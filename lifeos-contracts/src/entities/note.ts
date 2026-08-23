export interface INote {
  _id?: string;
  id?: string;
  userId?: string;
  title: string;
  content?: string;
  folder?: string;
  category?: string;
  tags?: string[];
  pinned?: boolean;
  archived?: boolean;
  date?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateNoteDTO {
  title: string;
  content?: string;
  folder?: string;
  category?: string;
  tags?: string[];
  pinned?: boolean;
}

export type UpdateNoteDTO = Partial<CreateNoteDTO>;

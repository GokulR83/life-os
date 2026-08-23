import { NoteModel } from '../models/note-model';
import { INote } from '../types/note-types';
import { NotFoundError, BadRequestError } from '../utils/app-error-util';
import { socketService } from './socket-service';

export const getAllNotesService = async (userId: string, query: any) => {
  const page = parseInt(query.page || '1', 10);
  const limit = parseInt(query.limit || '100', 10);
  const skip = (page - 1) * limit;

  const filter: any = { userId };
  if (query.folder) filter.folder = query.folder;
  if (query.category) filter.category = query.category;
  if (query.pinned !== undefined) filter.pinned = query.pinned === 'true';
  if (query.archived !== undefined) filter.archived = query.archived === 'true';
  if (query.search) {
    filter.$or = [
      { title: { $regex: query.search, $options: 'i' } },
      { content: { $regex: query.search, $options: 'i' } },
    ];
  }

  const [notes, total] = await Promise.all([
    NoteModel.find(filter).sort({ pinned: -1, updatedAt: -1 }).skip(skip).limit(limit),
    NoteModel.countDocuments(filter),
  ]);

  const sanitizedNotes = notes.map((n) => {
    const obj = n.toObject();
    return { ...obj, _id: n._id.toString(), id: n._id.toString() };
  });

  return { notes: sanitizedNotes, page, limit, total };
};

export const createNoteService = async (userId: string, payload: Partial<INote>): Promise<INote> => {
  if (!payload.title) {
    throw new BadRequestError('Note title is required.');
  }

  const todayStr = new Date().toISOString().split('T')[0];

  const newNote = await NoteModel.create({
    ...payload,
    folder: payload.folder || payload.category || 'General',
    category: payload.category || payload.folder || 'General',
    date: payload.date || todayStr,
    userId,
  });

  const obj = newNote.toObject();
  return { ...obj, _id: newNote._id.toString(), id: newNote._id.toString() };
};

export const getNoteByIdService = async (userId: string, id: string): Promise<INote> => {
  const note = await NoteModel.findOne({ _id: id, userId });
  if (!note) {
    throw new NotFoundError(`Note not found with ID: ${id}`);
  }

  const obj = note.toObject();
  return { ...obj, _id: note._id.toString(), id: note._id.toString() };
};

export const updateNoteService = async (userId: string, id: string, payload: Partial<INote>): Promise<INote> => {
  const note = await NoteModel.findOneAndUpdate({ _id: id, userId }, payload, {
    new: true,
    runValidators: true,
  });

  if (!note) {
    throw new NotFoundError(`Note not found with ID: ${id}`);
  }

  const obj = note.toObject();
  const sanitizedNote = { ...obj, _id: note._id.toString(), id: note._id.toString() };

  // Realtime Socket.io broadcast to connected clients in room
  socketService.broadcastNoteUpdate(id, sanitizedNote);

  return sanitizedNote;
};

export const deleteNoteService = async (userId: string, id: string): Promise<void> => {
  const note = await NoteModel.findOneAndDelete({ _id: id, userId });
  if (!note) {
    throw new NotFoundError(`Note not found with ID: ${id}`);
  }
};

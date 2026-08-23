import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler-util';
import { sendSuccess, sendCreated, sendPaginated, sendNoContent } from '../utils/response-handler-util';
import { socketService } from '../services/socket-service';
import {
  getAllNotesService,
  createNoteService,
  getNoteByIdService,
  updateNoteService,
  deleteNoteService,
} from '../services/note-service';

export const getAllNotes = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  const { notes, page, limit, total } = await getAllNotesService(userId, req.query);
  return sendPaginated(res, notes, page, limit, total, 'Notes retrieved successfully.');
});

export const createNote = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  const note = await createNoteService(userId, req.body);
  socketService.broadcastEntityUpdate('notes', 'create', note);
  return sendCreated(res, note, 'Note created successfully.');
});

export const getNoteById = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  const note = await getNoteByIdService(userId, req.params.id);
  return sendSuccess(res, note, 'Note retrieved successfully.');
});

export const updateNote = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  const note = await updateNoteService(userId, req.params.id, req.body);
  socketService.broadcastEntityUpdate('notes', 'update', note);
  return sendSuccess(res, note, 'Note updated successfully.');
});

export const deleteNote = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  await deleteNoteService(userId, req.params.id);
  socketService.broadcastEntityUpdate('notes', 'delete', { id: req.params.id });
  return sendNoContent(res);
});

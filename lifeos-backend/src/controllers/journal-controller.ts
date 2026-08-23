import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler-util';
import { sendSuccess, sendCreated, sendPaginated, sendNoContent } from '../utils/response-handler-util';
import { socketService } from '../services/socket-service';
import {
  getAllJournalsService,
  createJournalService,
  getJournalByIdService,
  updateJournalService,
  deleteJournalService,
} from '../services/journal-service';

export const getAllJournals = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  const { journals, page, limit, total } = await getAllJournalsService(userId, req.query);
  return sendPaginated(res, journals, page, limit, total, 'Journals retrieved successfully.');
});

export const createJournal = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  const journal = await createJournalService(userId, req.body);
  socketService.broadcastEntityUpdate('journals', 'create', journal);
  return sendCreated(res, journal, 'Journal entry created successfully.');
});

export const getJournalById = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  const journal = await getJournalByIdService(userId, req.params.id);
  return sendSuccess(res, journal, 'Journal entry retrieved successfully.');
});

export const updateJournal = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  const journal = await updateJournalService(userId, req.params.id, req.body);
  socketService.broadcastEntityUpdate('journals', 'update', journal);
  return sendSuccess(res, journal, 'Journal entry updated successfully.');
});

export const deleteJournal = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  await deleteJournalService(userId, req.params.id);
  socketService.broadcastEntityUpdate('journals', 'delete', { id: req.params.id });
  return sendNoContent(res);
});

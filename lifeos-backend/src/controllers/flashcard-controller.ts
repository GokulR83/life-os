import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler-util';
import { sendSuccess, sendCreated, sendPaginated, sendNoContent } from '../utils/response-handler-util';
import { socketService } from '../services/socket-service';
import {
  getAllFlashcardsService,
  createFlashcardService,
  generateAiFlashcardService,
  getFlashcardByIdService,
  updateFlashcardService,
  toggleFlashcardRevisionService,
  deleteFlashcardService,
} from '../services/flashcard-service';

export const getAllFlashcards = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  const { flashcards, page, limit, total } = await getAllFlashcardsService(userId, req.query);
  return sendPaginated(res, flashcards, page, limit, total, 'Flashcards retrieved successfully.');
});

export const generateAiFlashcard = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  const card = await generateAiFlashcardService(userId, req.body);
  socketService.broadcastEntityUpdate('flashcards', 'create', card);
  return sendCreated(res, card, 'AI Flashcard generated successfully.');
});

export const createFlashcard = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  const card = await createFlashcardService(userId, req.body);
  socketService.broadcastEntityUpdate('flashcards', 'create', card);
  return sendCreated(res, card, 'Flashcard created successfully.');
});

export const getFlashcardById = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  const card = await getFlashcardByIdService(userId, req.params.id);
  return sendSuccess(res, card, 'Flashcard retrieved successfully.');
});

export const updateFlashcard = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  const card = await updateFlashcardService(userId, req.params.id, req.body);
  socketService.broadcastEntityUpdate('flashcards', 'update', card);
  return sendSuccess(res, card, 'Flashcard updated successfully.');
});

export const toggleFlashcardRevision = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  const card = await toggleFlashcardRevisionService(userId, req.params.id);
  socketService.broadcastEntityUpdate('flashcards', 'update', card);
  return sendSuccess(res, card, 'Flashcard revision status toggled.');
});

export const deleteFlashcard = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  await deleteFlashcardService(userId, req.params.id);
  socketService.broadcastEntityUpdate('flashcards', 'delete', { id: req.params.id });
  return sendNoContent(res);
});

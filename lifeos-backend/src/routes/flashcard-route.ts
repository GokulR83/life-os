import { Router } from 'express';
import {
  getAllFlashcards,
  createFlashcard,
  generateAiFlashcard,
  getFlashcardById,
  updateFlashcard,
  toggleFlashcardRevision,
  deleteFlashcard,
} from '../controllers/flashcard-controller';
import { protect } from '../middleware/auth-middleware';
import { validateRequest } from '../middleware/validate-middleware';
import { CreateFlashcardSchema, UpdateFlashcardSchema, GenerateAiFlashcardSchema } from '@lifeos/contracts';

const flashcardRouter = Router();

flashcardRouter.use(protect);
flashcardRouter.get('/', getAllFlashcards);
flashcardRouter.post('/', validateRequest(CreateFlashcardSchema), createFlashcard);
flashcardRouter.post('/generate-ai', validateRequest(GenerateAiFlashcardSchema), generateAiFlashcard);
flashcardRouter.patch('/:id/toggle', toggleFlashcardRevision);
flashcardRouter.get('/:id', getFlashcardById);
flashcardRouter.put('/:id', validateRequest(UpdateFlashcardSchema), updateFlashcard);
flashcardRouter.delete('/:id', deleteFlashcard);

export default flashcardRouter;

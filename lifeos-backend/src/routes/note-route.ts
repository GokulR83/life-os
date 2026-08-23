import { Router } from 'express';
import { getAllNotes, createNote, getNoteById, updateNote, deleteNote } from '../controllers/note-controller';
import { protect } from '../middleware/auth-middleware';
import { validateRequest } from '../middleware/validate-middleware';
import { CreateNoteSchema, UpdateNoteSchema } from '@lifeos/contracts';

const noteRouter = Router();

noteRouter.use(protect);
noteRouter.get('/', getAllNotes);
noteRouter.post('/', validateRequest(CreateNoteSchema), createNote);
noteRouter.get('/:id', getNoteById);
noteRouter.put('/:id', validateRequest(UpdateNoteSchema), updateNote);
noteRouter.delete('/:id', deleteNote);

export default noteRouter;

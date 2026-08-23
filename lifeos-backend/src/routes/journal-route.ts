import { Router } from 'express';
import { getAllJournals, createJournal, getJournalById, updateJournal, deleteJournal } from '../controllers/journal-controller';
import { protect } from '../middleware/auth-middleware';
import { validateRequest } from '../middleware/validate-middleware';
import { CreateJournalSchema, UpdateJournalSchema } from '@lifeos/contracts';

const journalRouter = Router();

journalRouter.use(protect);
journalRouter.get('/', getAllJournals);
journalRouter.post('/', validateRequest(CreateJournalSchema), createJournal);
journalRouter.get('/:id', getJournalById);
journalRouter.put('/:id', validateRequest(UpdateJournalSchema), updateJournal);
journalRouter.delete('/:id', deleteJournal);

export default journalRouter;

import { Router } from 'express';
import { getNotificationsController, markAllReadController } from '../controllers/notification-controller';

const router = Router();

router.get('/', getNotificationsController);
router.post('/mark-read', markAllReadController);

export default router;

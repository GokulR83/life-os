import { Request, Response } from 'express';
import { getNotificationsService, markAllNotificationsReadService } from '../services/notification-service';

export const getNotificationsController = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;
    const notifications = await getNotificationsService(userId);
    res.json({ success: true, data: notifications });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch notifications' });
  }
};

export const markAllReadController = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;
    const { notificationIds } = req.body || {};
    const result = await markAllNotificationsReadService(userId, notificationIds);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to mark notifications read' });
  }
};

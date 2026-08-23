import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler-util';
import { sendSuccess } from '../utils/response-handler-util';
import { getDashboardSummaryService, getHeatmapDataService } from '../services/dashboard-service';

export const getDashboardSummary = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  const summary = await getDashboardSummaryService(userId);
  return sendSuccess(res, summary, 'Dashboard summary retrieved successfully.');
});

export const getHeatmapData = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  const heatmap = await getHeatmapDataService(userId);
  return sendSuccess(res, heatmap, 'Heatmap data retrieved successfully.');
});

import { Router } from 'express';
import { getDashboardSummary, getHeatmapData } from '../controllers/dashboard-controller';
import { protect } from '../middleware/auth-middleware';

const dashboardRouter = Router();

dashboardRouter.use(protect);
dashboardRouter.get('/summary', getDashboardSummary);
dashboardRouter.get('/heatmap', getHeatmapData);

export default dashboardRouter;

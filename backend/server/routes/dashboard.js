import { Router } from 'express';
import auth from '../middleware/auth.js';
import { getDashboardOverview } from '../controllers/dashboard.controller.js';

const router = Router();

router.get('/overview', auth, getDashboardOverview);

export default router;

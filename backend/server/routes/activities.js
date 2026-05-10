import { Router } from 'express';
import { getActivities, getActivityById } from '../controllers/activities.controller.js';

const router = Router();

router.get('/', getActivities);
router.get('/:id', getActivityById);

export default router;

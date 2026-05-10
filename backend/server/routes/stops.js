import { Router } from 'express';
import auth from '../middleware/auth.js';
import { createStopActivity, getStopActivities, deleteStopActivity } from '../controllers/stops.controller.js';

const router = Router();

router.post('/:stopId/activities', auth, createStopActivity);
router.get('/:stopId/activities', auth, getStopActivities);
router.delete('/:stopId/activities/:id', auth, deleteStopActivity);

export default router;

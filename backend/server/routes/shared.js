import { Router } from 'express';
import auth from '../middleware/auth.js';
import { shareTrip, getSharedTrip, copySharedTrip } from '../controllers/shared.controller.js';

const router = Router();

router.post('/trips/:id/share', auth, shareTrip);
router.get('/:slug', getSharedTrip);
router.post('/:slug/copy', auth, copySharedTrip);

export default router;

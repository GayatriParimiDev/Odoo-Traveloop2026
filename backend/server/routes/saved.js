import { Router } from 'express';
import auth from '../middleware/auth.js';
import { getSavedDestinations, saveDestination, deleteSavedDestination } from '../controllers/saved.controller.js';

const router = Router();

router.get('/', auth, getSavedDestinations);
router.post('/', auth, saveDestination);
router.delete('/:cityId', auth, deleteSavedDestination);

export default router;

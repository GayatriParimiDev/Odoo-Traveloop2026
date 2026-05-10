import { Router } from 'express';
import auth from '../middleware/auth.js';
import { getProfile, updateProfile, deleteAccount } from '../controllers/users.controller.js';

const router = Router();

router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.delete('/account', auth, deleteAccount);

export default router;

import { Router } from 'express';
import auth from '../middleware/auth.js';
import { register, login, me, refresh, logout } from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', auth, me);

export default router;

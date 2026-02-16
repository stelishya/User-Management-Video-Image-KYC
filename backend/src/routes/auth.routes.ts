
import { Router } from 'express';
import { register, login, refreshToken } from '../controllers/auth.controller';

const router = Router();

router.post('/signup', register);
router.post('/login', login);
router.post('/refresh', refreshToken);

export default router;

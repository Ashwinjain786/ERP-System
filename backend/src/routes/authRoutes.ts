import { Router } from 'express';
import { loginUser, logoutUser, getCurrentUser } from '../controllers/authController';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = Router();

router.post('/login', loginUser);
router.post('/logout', authenticateJWT, logoutUser);
router.get('/me', authenticateJWT, getCurrentUser);

export default router;

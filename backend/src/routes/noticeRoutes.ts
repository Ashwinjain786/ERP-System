import { Router } from 'express';
import { getNotices, createNotice } from '../controllers/noticeController';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';

const router = Router();
router.use(authenticateJWT);

router.get('/', authorizeRoles('all'), getNotices);
router.post('/', authorizeRoles('admin', 'faculty', 'hod', 'management'), createNotice);

export default router;

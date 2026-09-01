import { Router } from 'express';
import { getNotices, createNotice, updateNotice, deleteNotice, togglePinNotice } from '../controllers/noticeController';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', authorizeRoles('all'), getNotices);
router.post('/', authorizeRoles('admin', 'faculty', 'hod', 'management'), createNotice);
router.put('/:id', authorizeRoles('admin', 'faculty', 'hod', 'management'), updateNotice);
router.patch('/:id/pin', authorizeRoles('admin', 'management'), togglePinNotice);
router.delete('/:id', authorizeRoles('admin', 'faculty', 'hod', 'management'), deleteNotice);

export default router;

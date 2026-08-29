import { Router } from 'express';
import { getTimetables, generateTimetable } from '../controllers/timetableController';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';

const router = Router();
router.use(authenticateJWT);

router.get('/', authorizeRoles('admin', 'faculty', 'student'), getTimetables);
router.post('/', authorizeRoles('admin', 'hod'), generateTimetable);

export default router;

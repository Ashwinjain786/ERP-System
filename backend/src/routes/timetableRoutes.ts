import { Router } from 'express';
import { getTimetables, generateTimetable, saveTimetable } from '../controllers/timetableController';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';

const router = Router();
router.use(authenticateJWT);

router.get('/', authorizeRoles('admin', 'faculty', 'student'), getTimetables);
router.post('/generate', authorizeRoles('admin', 'hod'), generateTimetable);
router.post('/save', authorizeRoles('admin', 'hod'), saveTimetable);

export default router;

import { Router } from 'express';
import { getExaminations, createExamination, getExamResults, submitExamResults } from '../controllers/examinationController';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';

const router = Router();
router.use(authenticateJWT);

router.get('/', authorizeRoles('admin', 'faculty', 'student'), getExaminations);
router.post('/', authorizeRoles('admin'), createExamination);
router.get('/:id/results', authorizeRoles('admin', 'faculty', 'student'), getExamResults);
router.post('/:id/results', authorizeRoles('faculty', 'admin'), submitExamResults);

export default router;

import { Router } from 'express';
import { 
  getExaminations, createExamination, updateExamination, deleteExamination, 
  releaseHallTickets, getExamResults, submitExamResults, 
  exportExaminations, getExamStats, downloadExamResults, remindFaculty
} from '../controllers/examinationController';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';

const router = Router();
router.use(authenticateJWT);

router.get('/', authorizeRoles('admin', 'faculty', 'student'), getExaminations);
router.get('/export', authorizeRoles('admin', 'management'), exportExaminations);
router.get('/:id/stats', authorizeRoles('admin', 'management', 'faculty'), getExamStats);
router.get('/:id/download-results', authorizeRoles('admin', 'management', 'faculty'), downloadExamResults);
router.post('/:id/remind', authorizeRoles('admin', 'management'), remindFaculty);
router.post('/', authorizeRoles('admin'), createExamination);
router.put('/:id', authorizeRoles('admin'), updateExamination);
router.delete('/:id', authorizeRoles('admin'), deleteExamination);
router.post('/:id/hall-tickets', authorizeRoles('admin'), releaseHallTickets);
router.get('/:id/results', authorizeRoles('admin', 'faculty', 'student'), getExamResults);
router.post('/:id/results', authorizeRoles('faculty', 'admin'), submitExamResults);

export default router;

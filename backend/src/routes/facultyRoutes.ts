import { Router } from 'express';
import {
  getFacultyList,
  createFaculty,
  getFacultyById,
  updateFaculty,
  getFacultyWorkload,
  getLeaveRequests
} from '../controllers/facultyController';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', authorizeRoles('admin', 'student', 'faculty'), getFacultyList);
router.post('/', authorizeRoles('admin'), createFaculty);
router.get('/:id', authorizeRoles('admin', 'faculty', 'student'), getFacultyById);
router.put('/:id', authorizeRoles('admin', 'faculty'), updateFaculty);
router.get('/:id/workload', authorizeRoles('admin', 'faculty'), getFacultyWorkload);
router.get('/:id/leaves', authorizeRoles('admin', 'faculty'), getLeaveRequests);

export default router;

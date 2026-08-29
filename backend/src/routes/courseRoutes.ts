import { Router } from 'express';
import { getCourses, createCourse, getCourseById, updateCourse } from '../controllers/courseController';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';

const router = Router();
router.use(authenticateJWT);

router.get('/', authorizeRoles('admin', 'faculty', 'student'), getCourses);
router.post('/', authorizeRoles('admin'), createCourse);
router.get('/:id', authorizeRoles('admin', 'faculty', 'student'), getCourseById);
router.put('/:id', authorizeRoles('admin'), updateCourse);

export default router;

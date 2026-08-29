import { Router } from 'express';
import { getDepartments, createDepartment, updateDepartment } from '../controllers/departmentController';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';

const router = Router();
router.use(authenticateJWT);

router.get('/', authorizeRoles('admin', 'faculty', 'student'), getDepartments);
router.post('/', authorizeRoles('admin'), createDepartment);
router.put('/:id', authorizeRoles('admin'), updateDepartment);

export default router;

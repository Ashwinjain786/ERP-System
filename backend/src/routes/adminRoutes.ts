import { Router } from 'express';
import { getAdmissions, getRolePermissions } from '../controllers/adminController';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';

const router = Router();
router.use(authenticateJWT);

router.get('/admissions', authorizeRoles('admin', 'management'), getAdmissions);
router.get('/roles', authorizeRoles('admin', 'management'), getRolePermissions);

export default router;

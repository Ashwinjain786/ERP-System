import { Router } from 'express';
import { getAdmissions, updateAdmissionStatus, getRolePermissions, updateRolePermissions, createAdminUser } from '../controllers/adminController';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';

const router = Router();
router.use(authenticateJWT);

router.get('/admissions', authorizeRoles('admin', 'management'), getAdmissions);
router.put('/admissions/:id', authorizeRoles('admin', 'management'), updateAdmissionStatus);
router.get('/roles', authorizeRoles('admin', 'management'), getRolePermissions);
router.put('/roles/:role/permissions', authorizeRoles('admin', 'management'), updateRolePermissions);
router.post('/users', authorizeRoles('admin'), createAdminUser);

export default router;

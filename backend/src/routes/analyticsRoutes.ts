import { Router } from 'express';
import { 
  getInstitutionalOverview, 
  getAdmissionsAnalytics, 
  getAcademicPerformanceAnalytics, 
  getPlacementAnalytics 
} from '../controllers/analyticsController';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';

const router = Router();
router.use(authenticateJWT);

// These routes should likely be restricted to management, admin, or specific roles
router.get('/overview', authorizeRoles('admin', 'management', 'hod'), getInstitutionalOverview);
router.get('/admissions', authorizeRoles('admin', 'management'), getAdmissionsAnalytics);
router.get('/academic-performance', authorizeRoles('admin', 'management', 'hod'), getAcademicPerformanceAnalytics);
router.get('/placements', authorizeRoles('admin', 'management'), getPlacementAnalytics);

export default router;

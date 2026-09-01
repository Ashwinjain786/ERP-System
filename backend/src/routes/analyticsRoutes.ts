import { Router } from 'express';
import { 
  getInstitutionalOverview, 
  getAdmissionsAnalytics, 
  getAcademicPerformanceAnalytics, 
  getPlacementAnalytics,
  getSystemActivity,
  getFinancialHealthAnalytics,
  exportAdmissionsReport
} from '../controllers/analyticsController';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';

const router = Router();
router.use(authenticateJWT);

// These routes should likely be restricted to management, admin, or specific roles
router.get('/overview', authorizeRoles('admin', 'management', 'hod'), getInstitutionalOverview);
router.get('/admissions', authorizeRoles('admin', 'management'), getAdmissionsAnalytics);
router.get('/admissions/report', authorizeRoles('admin', 'management'), exportAdmissionsReport);
router.get('/academic-performance', authorizeRoles('admin', 'management', 'hod'), getAcademicPerformanceAnalytics);
router.get('/placements', authorizeRoles('admin', 'management'), getPlacementAnalytics);
router.get('/activity', authorizeRoles('admin', 'management'), getSystemActivity);
router.get('/financial-health', authorizeRoles('admin', 'management'), getFinancialHealthAnalytics);

export default router;

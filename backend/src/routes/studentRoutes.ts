import { Router } from 'express';
import { 
  getStudents, 
  createStudent, 
  getStudentById, 
  updateStudent,
  getStudentAttendance,
  getStudentGrades,
  getStudentFees,
  getStudentDocuments
} from '../controllers/studentController';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';

const router = Router();

router.use(authenticateJWT); // Secure all student routes

router.get('/', authorizeRoles('admin', 'faculty', 'student'), getStudents);
router.post('/', authorizeRoles('admin'), createStudent);
router.get('/:id', authorizeRoles('admin', 'faculty', 'student'), getStudentById);
router.put('/:id', authorizeRoles('admin', 'student'), updateStudent);
router.get('/:id/attendance', authorizeRoles('admin', 'faculty', 'student'), getStudentAttendance);
router.get('/:id/grades', authorizeRoles('admin', 'faculty', 'student'), getStudentGrades);
router.get('/:id/fees', authorizeRoles('admin', 'finance_officer', 'student'), getStudentFees);
router.get('/:id/documents', authorizeRoles('admin', 'faculty', 'student'), getStudentDocuments);

export default router;

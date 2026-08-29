import { Router } from 'express';
import { getFeeStructures, createFeeStructure, getFeeTransactions, recordFeePayment, getFeeDefaulters } from '../controllers/feeController';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';

const router = Router();
router.use(authenticateJWT);

router.get('/structures', authorizeRoles('admin', 'student'), getFeeStructures);
router.post('/structures', authorizeRoles('admin', 'finance_officer'), createFeeStructure);
router.get('/transactions', authorizeRoles('admin', 'finance_officer', 'student'), getFeeTransactions);
router.post('/transactions', authorizeRoles('admin', 'finance_officer', 'student'), recordFeePayment);
router.get('/defaulters', authorizeRoles('admin', 'finance_officer'), getFeeDefaulters);

export default router;

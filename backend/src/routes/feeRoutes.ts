import { Router } from 'express';
import { getFeeStructures, createFeeStructure, getFeeTransactions, recordFeePayment, updateFeeTransactionStatus, getFeeDefaulters } from '../controllers/feeController';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';

const router = Router();
router.use(authenticateJWT);

router.get('/structures', authorizeRoles('admin', 'finance_officer', 'management'), getFeeStructures);
router.post('/structures', authorizeRoles('admin', 'finance_officer'), createFeeStructure);
router.get('/transactions', authorizeRoles('admin', 'finance_officer', 'management', 'student'), getFeeTransactions);
router.post('/transactions', authorizeRoles('admin', 'finance_officer', 'student'), recordFeePayment);
router.patch('/transactions/:id/status', authorizeRoles('admin', 'finance_officer'), updateFeeTransactionStatus);
router.get('/defaulters', authorizeRoles('admin', 'finance_officer', 'management'), getFeeDefaulters);

export default router;

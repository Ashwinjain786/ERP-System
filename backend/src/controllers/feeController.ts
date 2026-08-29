import { Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middlewares/authMiddleware';

const PAYMENT_METHODS = new Set(['UPI', 'NetBanking', 'CreditCard', 'DebitCard', 'Challan', 'DemandDraft']);
const PAYMENT_STATUSES = new Set(['success', 'pending', 'failed', 'refunded']);

const getFeeStructureForStudent = async (studentId: string) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { feeTransactions: { where: { status: 'success' } } },
  });
  if (!student) return null;

  const feeStructure = await prisma.feeStructure.findUnique({
    where: { program_quota: { program: student.degree || 'B.Tech', quota: student.feeQuota } },
  });

  return { student, feeStructure };
};

const syncStudentFeeStatus = async (studentId: string) => {
  const result = await getFeeStructureForStudent(studentId);
  if (!result?.feeStructure) return null;

  const paidAmount = result.student.feeTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  const feeStatus = paidAmount >= result.feeStructure.totalAmount
    ? 'paid'
    : paidAmount > 0
      ? 'partial'
      : 'due';

  await prisma.student.update({ where: { id: studentId }, data: { feeStatus } });
  return { feeStatus, paidAmount, feeStructure: result.feeStructure };
};

export const getFeeStructures = async (_req: AuthRequest, res: Response) => {
  try {
    const structures = await prisma.feeStructure.findMany({ orderBy: [{ program: 'asc' }, { quota: 'asc' }] });
    res.json(structures);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createFeeStructure = async (req: AuthRequest, res: Response) => {
  try {
    const { program, quota = 'general', tuitionFee = 0, hostelFee = 0, examFee = 0, libraryDeposit = 0, dueDate } = req.body;
    const amounts = [tuitionFee, hostelFee, examFee, libraryDeposit].map(Number);
    if (!program?.trim() || !['general', 'merit', 'management', 'nri'].includes(quota) ||
      amounts.some((amount) => !Number.isFinite(amount) || amount < 0)) {
      return res.status(400).json({ success: false, message: 'A program, valid quota, and non-negative fee amounts are required' });
    }

    const parsedDueDate = dueDate ? new Date(dueDate) : new Date(new Date().setMonth(new Date().getMonth() + 1));
    if (Number.isNaN(parsedDueDate.getTime())) {
      return res.status(400).json({ success: false, message: 'A valid due date is required' });
    }

    const totalAmount = amounts.reduce((sum, amount) => sum + amount, 0);

    const structure = await prisma.feeStructure.upsert({
      where: { program_quota: { program: program.trim(), quota } },
      update: {
        tuitionFee: amounts[0],
        hostelFee: amounts[1],
        examFee: amounts[2],
        libraryDeposit: amounts[3],
        totalAmount,
        dueDate: parsedDueDate,
      },
      create: {
        program: program.trim(),
        quota,
        tuitionFee: amounts[0],
        hostelFee: amounts[1],
        examFee: amounts[2],
        libraryDeposit: amounts[3],
        totalAmount,
        dueDate: parsedDueDate,
      },
    });

    const affectedStudents = await prisma.student.findMany({
      where: { degree: program.trim(), feeQuota: quota },
      select: { id: true },
    });
    await Promise.all(affectedStudents.map((student) => syncStudentFeeStatus(student.id)));

    res.status(201).json(structure);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getFeeTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const { studentId, status } = req.query;
    let whereClause: any = {};
    if (status && (!PAYMENT_STATUSES.has(String(status)))) {
      return res.status(400).json({ success: false, message: 'Invalid transaction status' });
    }
    if (req.user?.role === 'student') {
      const profile = await prisma.student.findUnique({ where: { userId: req.user.id }, select: { id: true } });
      if (!profile) return res.status(403).json({ success: false, message: 'Student profile not found' });
      whereClause.studentId = profile.id;
    } else if (studentId) {
      whereClause.studentId = String(studentId);
    }
    if (status) whereClause.status = String(status);

    const transactions = await prisma.feeTransaction.findMany({
      where: whereClause,
      include: { student: { include: { user: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = transactions.map(t => ({
      id: t.id,
      receiptNumber: t.receiptNumber,
      studentId: t.studentId,
      studentName: t.student.user.name,
      amount: t.amount,
      paymentMethod: t.paymentMethod,
      status: t.status,
      paidAt: t.paidAt,
      createdAt: t.createdAt,
      program: t.student.degree || 'B.Tech',
      quota: t.student.feeQuota,
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const recordFeePayment = async (req: AuthRequest, res: Response) => {
  try {
    const { studentId, amount, paymentMethod } = req.body;
    const numericAmount = Number(amount);
    if (!studentId || !Number.isFinite(numericAmount) || numericAmount <= 0 || !PAYMENT_METHODS.has(paymentMethod)) {
      return res.status(400).json({ success: false, message: 'A student, positive amount, and valid payment method are required' });
    }

    if (req.user?.role === 'student') {
      const profile = await prisma.student.findUnique({ where: { userId: req.user.id }, select: { id: true } });
      if (!profile || profile.id !== studentId) {
        return res.status(403).json({ success: false, message: 'Students may only submit payments for their own account' });
      }
    }

    const studentFee = await getFeeStructureForStudent(studentId);
    if (!studentFee) return res.status(404).json({ success: false, message: 'Student not found' });
    if (!studentFee.feeStructure) {
      return res.status(422).json({ success: false, message: 'No fee structure is configured for this student program' });
    }
    const committed = await prisma.feeTransaction.aggregate({
      where: { studentId, status: { in: ['success', 'pending'] } },
      _sum: { amount: true },
    });
    const remaining = studentFee.feeStructure.totalAmount - (committed._sum.amount || 0);
    if (numericAmount > remaining) {
      return res.status(422).json({ success: false, message: 'Payment amount exceeds the remaining fee balance' });
    }

    const isStudentPayment = req.user?.role === 'student';
    const receiptNumber = `RCPT-${Date.now()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    
    const transaction = await prisma.feeTransaction.create({
      data: {
        receiptNumber,
        studentId,
        amount: numericAmount,
        paymentMethod,
        status: isStudentPayment ? 'pending' : 'success',
        paidAt: isStudentPayment ? null : new Date(),
      },
    });

    if (!isStudentPayment) await syncStudentFeeStatus(studentId);

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateFeeTransactionStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    if (!['success', 'failed', 'refunded'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be success, failed, or refunded' });
    }

    const existing = await prisma.feeTransaction.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Transaction not found' });

    if (status === 'success') {
      const fee = await getFeeStructureForStudent(existing.studentId);
      if (!fee?.feeStructure) return res.status(422).json({ success: false, message: 'No fee structure is configured for this student program' });
      const otherCommitted = await prisma.feeTransaction.aggregate({
        where: { studentId: existing.studentId, id: { not: existing.id }, status: { in: ['success', 'pending'] } },
        _sum: { amount: true },
      });
      if ((otherCommitted._sum.amount || 0) + existing.amount > fee.feeStructure.totalAmount) {
        return res.status(422).json({ success: false, message: 'Approving this payment would exceed the fee balance' });
      }
    }

    const transaction = await prisma.feeTransaction.update({
      where: { id: existing.id },
      data: { status, paidAt: status === 'success' ? (existing.paidAt || new Date()) : existing.paidAt },
    });
    await syncStudentFeeStatus(transaction.studentId);
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getFeeDefaulters = async (req: AuthRequest, res: Response) => {
  try {
    const { department, semester } = req.query;
    const where: any = {};
    if (department) where.department = { name: String(department) };
    if (semester) {
      const parsedSemester = Number(semester);
      if (!Number.isInteger(parsedSemester) || parsedSemester < 1) {
        return res.status(400).json({ success: false, message: 'Semester must be a positive integer' });
      }
      where.semester = parsedSemester;
    }

    const [students, structures] = await Promise.all([
      prisma.student.findMany({
        where,
      include: { 
        user: true, 
        department: true,
        feeTransactions: {
          where: { status: 'success' }
        }
      },
      }),
      prisma.feeStructure.findMany(),
    ]);
    const structuresByProgram = new Map(
      structures.map((structure) => [`${structure.program}:${structure.quota}`, structure]),
    );

    const formatted = [];
    for (const d of students) {
      const structure = structuresByProgram.get(`${d.degree || 'B.Tech'}:${d.feeQuota}`);
      if (!structure) continue;
      
      const expectedAmount = structure.totalAmount;
      const paidAmount = d.feeTransactions.reduce((sum, t) => sum + t.amount, 0);
      const dueAmount = expectedAmount - paidAmount;
      
      if (dueAmount > 0) {
        const dueDate = structure.dueDate;
        const diffTime = Math.abs(new Date().getTime() - dueDate.getTime());
        const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        formatted.push({
          studentId: d.id,
          rollNumber: d.rollNumber,
          name: d.user.name,
          department: d.department.name,
          semester: d.semester,
          dueAmount,
          daysOverdue: new Date() > dueDate ? daysOverdue : 0,
          parentPhone: d.user.phone
        });
      }
    }

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

import { Request, Response } from 'express';
import prisma from '../config/db';

export const getFeeStructures = async (req: Request, res: Response) => {
  try {
    const structures = await prisma.feeStructure.findMany();
    res.json(structures);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createFeeStructure = async (req: Request, res: Response) => {
  try {
    const { program, quota, tuitionFee, hostelFee, examFee, libraryDeposit } = req.body;
    
    const totalAmount = (tuitionFee || 0) + (hostelFee || 0) + (examFee || 0) + (libraryDeposit || 0);

    const structure = await prisma.feeStructure.create({
      data: {
        program,
        quota,
        tuitionFee,
        hostelFee,
        examFee,
        libraryDeposit,
        totalAmount,
        dueDate: new Date(new Date().setMonth(new Date().getMonth() + 1)) // Due in 1 month
      }
    });

    res.json(structure);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getFeeTransactions = async (req: Request, res: Response) => {
  try {
    const { studentId, status } = req.query;
    let whereClause: any = {};
    if (studentId) whereClause.studentId = studentId;
    if (status) whereClause.status = status;

    const transactions = await prisma.feeTransaction.findMany({
      where: whereClause,
      include: { student: { include: { user: true } } }
    });

    const formatted = transactions.map(t => ({
      id: t.id,
      receiptNumber: t.receiptNumber,
      studentId: t.studentId,
      studentName: t.student.user.name,
      amount: t.amount,
      paymentMethod: t.paymentMethod,
      status: t.status,
      paidAt: t.paidAt
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const recordFeePayment = async (req: Request, res: Response) => {
  try {
    const { studentId, amount, paymentMethod } = req.body;
    
    const receiptNumber = `RCPT${Date.now()}`;
    
    const transaction = await prisma.feeTransaction.create({
      data: {
        receiptNumber,
        studentId,
        amount,
        paymentMethod,
        status: 'success',
        paidAt: new Date()
      }
    });

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getFeeDefaulters = async (req: Request, res: Response) => {
  try {
    const defaulters = await prisma.student.findMany({
      where: { feeStatus: 'due' },
      include: { user: true, department: true }
    });

    const formatted = defaulters.map(d => ({
      studentId: d.id,
      rollNumber: d.rollNumber,
      name: d.user.name,
      department: d.department.name,
      semester: d.semester,
      dueAmount: 50000, // mock amount
      daysOverdue: 15, // mock days
      parentPhone: d.user.phone
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

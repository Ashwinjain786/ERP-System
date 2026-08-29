import { Request, Response } from 'express';
import prisma from '../config/db';

export const getLibraryBooks = async (req: Request, res: Response) => {
  try {
    const { search, category, availableOnly } = req.query;
    let whereClause: any = {};
    if (category) whereClause.category = category;
    if (availableOnly === 'true') whereClause.availableCopies = { gt: 0 };
    if (search) {
      whereClause.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { author: { contains: search as string, mode: 'insensitive' } },
        { isbn: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const books = await prisma.book.findMany({ where: whereClause });
    res.json(books);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createLibraryBook = async (req: Request, res: Response) => {
  try {
    const { isbn, title, author, category, totalCopies, rackLocation } = req.body;

    if (!isbn?.trim() || !title?.trim() || !author?.trim() || !Number.isInteger(totalCopies) || totalCopies < 1) {
      return res.status(400).json({ success: false, message: 'ISBN, title, author, and a positive copy count are required' });
    }
    
    const book = await prisma.book.create({
      data: {
        isbn: isbn.trim(),
        title: title.trim(),
        author: author.trim(),
        category: category?.trim() || undefined,
        totalCopies,
        availableCopies: totalCopies,
        rackLocation
      }
    });

    res.json(book);
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return res.status(409).json({ success: false, message: 'A book with this ISBN already exists' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const issueLibraryBook = async (req: Request, res: Response) => {
  try {
    const { bookId, borrowerId, durationDays } = req.body;

    if (!bookId || !borrowerId) {
      return res.status(400).json({ success: false, message: 'Book and borrower are required' });
    }

    const borrower = await prisma.user.findUnique({ where: { id: borrowerId }, select: { id: true, role: true } });
    if (!borrower) return res.status(400).json({ success: false, message: 'Borrower not found' });
    if (borrower.role !== 'student' && borrower.role !== 'faculty') {
      return res.status(400).json({ success: false, message: 'Only students and faculty may borrow books' });
    }
    
    const borrowDuration = durationDays === undefined ? 14 : Number(durationDays);
    if (!Number.isInteger(borrowDuration) || borrowDuration < 1) {
      return res.status(400).json({ success: false, message: 'Borrow duration must be a positive number of days' });
    }

    const issueDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + borrowDuration);

    const record = await prisma.$transaction(async (tx) => {
      // Conditional update makes the stock check and decrement atomic.
      const decremented = await tx.book.updateMany({
        where: { id: bookId, availableCopies: { gt: 0 } },
        data: { availableCopies: { decrement: 1 } }
      });
      if (decremented.count !== 1) throw Object.assign(new Error('Book not available'), { code: 'BOOK_UNAVAILABLE' });

      // The book row lock acquired above serializes concurrent issues for this book.
      const existingLoan = await tx.circulationRecord.findFirst({
        where: { bookId, borrowerId, status: { in: ['issued', 'overdue'] } },
        select: { id: true }
      });
      if (existingLoan) throw Object.assign(new Error('Borrower already has this book'), { code: 'ACTIVE_LOAN_EXISTS' });

      return tx.circulationRecord.create({
        data: { bookId, borrowerId, issueDate, dueDate, status: 'issued' }
      });
    });

    res.json(record);
  } catch (error: any) {
    if (error?.code === 'ACTIVE_LOAN_EXISTS') {
      return res.status(409).json({ success: false, message: 'Borrower already has this book' });
    }
    if (error?.code === 'BOOK_UNAVAILABLE') {
      return res.status(400).json({ success: false, message: 'Book not available' });
    }
    if (error?.code === 'P2002') {
      return res.status(409).json({ success: false, message: 'This borrower already has an active loan for the book' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const returnLibraryBook = async (req: Request, res: Response) => {
  try {
    const { circulationId, waiveFine } = req.body;
    if (!circulationId) return res.status(400).json({ success: false, message: 'Circulation record is required' });
    
    const circulation = await prisma.circulationRecord.findUnique({ where: { id: circulationId } });
    if (!circulation) return res.status(404).json({ success: false, message: 'Record not found' });
    if (circulation.status === 'returned') {
      return res.status(400).json({ success: false, message: 'Book has already been returned' });
    }

    let fineAmount = 0;
    if (!waiveFine && new Date() > circulation.dueDate) {
      const diffTime = Math.abs(new Date().getTime() - circulation.dueDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      fineAmount = diffDays * 5; // 5 units per day overdue
    }

    const record = await prisma.$transaction(async (tx) => {
      const transitioned = await tx.circulationRecord.updateMany({
        where: { id: circulationId, status: { not: 'returned' } },
        data: { returnDate: new Date(), status: 'returned', fineAmount }
      });
      if (transitioned.count !== 1) throw Object.assign(new Error('Book has already been returned'), { code: 'ALREADY_RETURNED' });

      const restored = await tx.book.updateMany({
        where: { id: circulation.bookId, availableCopies: { lt: (await tx.book.findUniqueOrThrow({ where: { id: circulation.bookId }, select: { totalCopies: true } })).totalCopies } },
        data: { availableCopies: { increment: 1 } }
      });
      if (restored.count !== 1) {
        throw Object.assign(new Error('Book inventory is inconsistent'), { code: 'INVENTORY_INCONSISTENT' });
      }
      const updated = await tx.circulationRecord.findUniqueOrThrow({ where: { id: circulationId } });

      if (fineAmount > 0) {
        const existingFine = await tx.fineRecord.findFirst({ where: { circulationId: circulation.id } });
        if (!existingFine) {
          await tx.fineRecord.create({
            data: { userId: circulation.borrowerId, circulationId: circulation.id, amount: fineAmount, reason: 'Late return fine', status: 'unpaid' }
          });
        }
      }

      return updated;
    });

    res.json(record);
  } catch (error: any) {
    if (error?.code === 'ALREADY_RETURNED') {
      return res.status(400).json({ success: false, message: 'Book has already been returned' });
    }
    if (error?.code === 'INVENTORY_INCONSISTENT') {
      return res.status(409).json({ success: false, message: 'Book inventory is inconsistent; reconcile stock before returning it' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getLibraryFines = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    let whereClause: any = {};
    const requester = (req as any).user;
    if (requester?.role === 'librarian' || requester?.role === 'admin') {
      if (userId) whereClause.userId = userId;
    } else if (requester?.id) {
      whereClause.userId = requester.id;
    }

    const fines = await prisma.fineRecord.findMany({ where: whereClause, include: { user: true } });
    
    const formatted = fines.map(f => ({
      id: f.id,
      userId: f.userId,
      userName: f.user.name,
      amount: f.amount,
      reason: f.reason,
      status: f.status,
      issuedAt: f.issuedAt
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const payLibraryFine = async (req: Request, res: Response) => {
  try {
    const fine = await prisma.fineRecord.findUnique({ where: { id: req.params.id } });
    if (!fine) return res.status(404).json({ success: false, message: 'Fine not found' });
    if (fine.status !== 'unpaid') {
      return res.status(400).json({ success: false, message: 'Fine is already settled' });
    }

    const requester = (req as any).user;
    if (requester?.role !== 'librarian' && requester?.role !== 'admin' && fine.userId !== requester?.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to pay this fine' });
    }

    const updated = await prisma.fineRecord.update({
      where: { id: fine.id },
      data: { status: 'paid' }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getCirculationRecords = async (req: Request, res: Response) => {
  try {
    const { borrowerId, status } = req.query;
    const requestedStatus = typeof status === 'string' ? status : undefined;
    if (requestedStatus && !['issued', 'returned', 'overdue'].includes(requestedStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid circulation status' });
    }
    let whereClause: any = {};
    const requester = (req as any).user;
    if (requester?.role === 'librarian' || requester?.role === 'admin') {
      if (borrowerId) whereClause.borrowerId = borrowerId;
    } else if (requester?.id) {
      whereClause.borrowerId = requester.id;
    }
    // Overdue is derived from dueDate below, so it cannot be filtered directly by
    // the persisted status column.
    if (requestedStatus && requestedStatus !== 'overdue') whereClause.status = requestedStatus;

    const records = await prisma.circulationRecord.findMany({
      where: whereClause,
      include: {
        book: true,
        borrower: true
      }
    });

    const now = new Date();
    const formatted = records.map(r => ({
      id: r.id,
      bookId: r.bookId,
      bookTitle: r.book.title,
      borrowerId: r.borrowerId,
      borrowerName: r.borrower.name,
      issueDate: r.issueDate,
      dueDate: r.dueDate,
      returnDate: r.returnDate,
      status: r.status === 'issued' && r.dueDate < now ? 'overdue' : r.status,
      fineAmount: r.fineAmount
    })).filter(record => !requestedStatus || record.status === requestedStatus);

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

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
    
    const book = await prisma.book.create({
      data: {
        isbn,
        title,
        author,
        category,
        totalCopies,
        availableCopies: totalCopies,
        rackLocation
      }
    });

    res.json(book);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const issueLibraryBook = async (req: Request, res: Response) => {
  try {
    const { bookId, borrowerId, durationDays } = req.body;
    
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book || book.availableCopies <= 0) return res.status(400).json({ success: false, message: 'Book not available' });

    const issueDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (durationDays || 14));

    const record = await prisma.$transaction([
      prisma.book.update({
        where: { id: bookId },
        data: { availableCopies: { decrement: 1 } }
      }),
      prisma.circulationRecord.create({
        data: {
          bookId,
          borrowerId,
          issueDate,
          dueDate,
          status: 'issued'
        }
      })
    ]);

    res.json(record[1]);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const returnLibraryBook = async (req: Request, res: Response) => {
  try {
    const { circulationId, waiveFine } = req.body;
    
    const circulation = await prisma.circulationRecord.findUnique({ where: { id: circulationId } });
    if (!circulation) return res.status(404).json({ success: false, message: 'Record not found' });

    let fineAmount = 0;
    if (!waiveFine && new Date() > circulation.dueDate) {
      const diffTime = Math.abs(new Date().getTime() - circulation.dueDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      fineAmount = diffDays * 5; // 5 units per day overdue
    }

    const record = await prisma.$transaction(async (tx) => {
      await tx.book.update({
        where: { id: circulation.bookId },
        data: { availableCopies: { increment: 1 } }
      });

      const updated = await tx.circulationRecord.update({
        where: { id: circulationId },
        data: { returnDate: new Date(), status: 'returned', fineAmount }
      });

      if (fineAmount > 0) {
        await tx.fineRecord.create({
          data: {
            userId: circulation.borrowerId,
            amount: fineAmount,
            reason: 'Late return fine',
            status: 'unpaid'
          }
        });
      }

      return updated;
    });

    res.json(record);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getLibraryFines = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    let whereClause: any = {};
    if (userId) whereClause.userId = userId;

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

export const getCirculationRecords = async (req: Request, res: Response) => {
  try {
    const { borrowerId, status } = req.query;
    let whereClause: any = {};
    if (borrowerId) whereClause.borrowerId = borrowerId;
    if (status) whereClause.status = status;

    const records = await prisma.circulationRecord.findMany({
      where: whereClause,
      include: {
        book: true,
        borrower: true
      }
    });

    const formatted = records.map(r => ({
      id: r.id,
      bookId: r.bookId,
      bookTitle: r.book.title,
      borrowerId: r.borrowerId,
      borrowerName: r.borrower.name,
      issueDate: r.issueDate,
      dueDate: r.dueDate,
      returnDate: r.returnDate,
      status: r.status,
      fineAmount: r.fineAmount
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

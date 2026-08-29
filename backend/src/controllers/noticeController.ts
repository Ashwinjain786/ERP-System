import { Request, Response } from 'express';
import prisma from '../config/db';

export const getNotices = async (req: Request, res: Response) => {
  try {
    const { targetRole, department } = req.query;
    let whereClause: any = {};
    
    if (targetRole) {
      whereClause.OR = [
        { targetRole: targetRole as string },
        { targetRole: 'all' }
      ];
    }
    
    if (department) {
       whereClause.department = department; // in reality, might also include null (all depts)
    }

    const notices = await prisma.notice.findMany({
      where: whereClause,
      orderBy: { publishedAt: 'desc' }
    });

    res.json(notices);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createNotice = async (req: Request, res: Response) => {
  try {
    const { title, content, category, targetRole, department, isUrgent } = req.body;
    
    const notice = await prisma.notice.create({
      data: {
        title,
        content,
        category,
        targetRole,
        department,
        isUrgent,
        publishedBy: (req as any).user?.id
      }
    });

    res.json(notice);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

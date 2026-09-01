import { Request, Response } from 'express';
import prisma from '../config/db';
import { NoticeTargetRole } from '@prisma/client';

export const getNotices = async (req: Request, res: Response) => {
  try {
    const { targetRole, department } = req.query;
    const and: any[] = [];
    
    if (targetRole) {
      and.push({ OR: [
        { targetRole: targetRole as NoticeTargetRole },
        { targetRole: NoticeTargetRole.all }
      ] });
    }
    
    if (department) {
       and.push({ OR: [
         { department: department as string },
         { department: null }
       ] });
    }

    const notices = await prisma.notice.findMany({
      where: and.length ? { AND: and } : {},
      orderBy: [
        { isPinned: 'desc' },
        { publishedAt: 'desc' }
      ]
    });

    res.json(notices);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const togglePinNotice = async (req: Request, res: Response) => {
  try {
    const notice = await prisma.notice.findUnique({ where: { id: req.params.id } });
    if (!notice) return res.status(404).json({ success: false, message: 'Notice not found' });
    
    const updated = await prisma.notice.update({
      where: { id: req.params.id },
      data: { isPinned: !notice.isPinned }
    });
    res.json(updated);
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
        targetRole: (targetRole as NoticeTargetRole | undefined) || NoticeTargetRole.all,
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

export const updateNotice = async (req: Request, res: Response) => {
  try {
    const { title, content, category, targetRole, department, isUrgent } = req.body;
    const notice = await prisma.notice.update({
      where: { id: req.params.id },
      data: {
        title,
        content,
        category,
        targetRole: targetRole as NoticeTargetRole | undefined,
        department,
        isUrgent
      }
    });
    res.json(notice);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteNotice = async (req: Request, res: Response) => {
  try {
    await prisma.notice.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true, message: 'Notice deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete notice' });
  }
};

import { Request, Response } from 'express';
import prisma from '../config/db';

export const getAdmissions = async (req: Request, res: Response) => {
  try {
    const apps = await prisma.admissionApplication.findMany();
    res.json(apps);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getRolePermissions = async (req: Request, res: Response) => {
  try {
    const perms = await prisma.permission.findMany({
      include: {
        roles: true
      }
    });

    res.json(perms);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

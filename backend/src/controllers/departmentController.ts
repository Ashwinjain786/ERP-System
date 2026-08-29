import { Request, Response } from 'express';
import prisma from '../config/db';

export const getDepartments = async (req: Request, res: Response) => {
  try {
    const departments = await prisma.department.findMany({
      include: {
        _count: {
          select: { students: true, faculty: true }
        }
      }
    });
    
    const formatted = departments.map(d => ({
      id: d.id,
      code: d.code,
      name: d.name,
      headOfDepartment: d.headOfDepartment,
      facultyCount: d._count.faculty,
      studentCount: d._count.students
    }));
    
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createDepartment = async (req: Request, res: Response) => {
  try {
    const { code, name, headOfDepartment } = req.body;
    
    const department = await prisma.department.create({
      data: { code, name, headOfDepartment }
    });
    
    res.json(department);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

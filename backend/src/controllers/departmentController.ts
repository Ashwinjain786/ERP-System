import { Request, Response } from 'express';
import prisma from '../config/db';

export const getDepartments = async (req: Request, res: Response) => {
  try {
    const departments = await prisma.department.findMany({
      include: {
        // headOfDepartment is now a proper FK relation — fetch the name
        headOfDepartment: {
          include: { user: true }
        },
        _count: {
          select: { students: true, faculty: true }
        }
      }
    });

    const formatted = departments.map(d => ({
      id: d.id,
      code: d.code,
      name: d.name,
      headOfDepartmentId: d.headOfDepartmentId,
      headOfDepartment: d.headOfDepartment
        ? `${d.headOfDepartment.user.name} (${d.headOfDepartment.designation})`
        : null,
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
    const { code, name, headOfDepartmentId } = req.body;

    const department = await prisma.department.create({
      data: { code, name, headOfDepartmentId: headOfDepartmentId || null }
    });

    res.json(department);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateDepartment = async (req: Request, res: Response) => {
  try {
    const { name, headOfDepartmentId } = req.body;

    const department = await prisma.department.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        headOfDepartmentId: headOfDepartmentId !== undefined ? headOfDepartmentId : undefined,
      },
      include: {
        headOfDepartment: { include: { user: true } },
        _count: { select: { students: true, faculty: true } }
      }
    });

    res.json({
      id: department.id,
      code: department.code,
      name: department.name,
      headOfDepartmentId: department.headOfDepartmentId,
      headOfDepartment: department.headOfDepartment
        ? `${department.headOfDepartment.user.name} (${department.headOfDepartment.designation})`
        : null,
      facultyCount: department._count.faculty,
      studentCount: department._count.students
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

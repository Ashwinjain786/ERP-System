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
    const code = typeof req.body.code === 'string' ? req.body.code.trim().toUpperCase() : '';
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
    const headOfDepartmentId = req.body.headOfDepartmentId || null;
    if (!code || !name) return res.status(400).json({ success: false, message: 'Department code and name are required' });
    if (headOfDepartmentId) {
      const faculty = await prisma.faculty.findUnique({ where: { id: headOfDepartmentId } });
      if (!faculty) return res.status(400).json({ success: false, message: 'Head of department faculty not found' });
    }

    const department = await prisma.department.create({
      data: { code, name, headOfDepartmentId: headOfDepartmentId || null }
    });

    res.status(201).json(department);
  } catch (error) {
    if ((error as any)?.code === 'P2002') return res.status(409).json({ success: false, message: 'Department code or name already exists' });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateDepartment = async (req: Request, res: Response) => {
  try {
    const name = req.body.name === undefined ? undefined : String(req.body.name).trim();
    const headOfDepartmentId = req.body.headOfDepartmentId === undefined ? undefined : (req.body.headOfDepartmentId || null);
    if (name !== undefined && !name) return res.status(400).json({ success: false, message: 'Department name cannot be empty' });
    if (headOfDepartmentId) {
      const faculty = await prisma.faculty.findUnique({ where: { id: headOfDepartmentId } });
      if (!faculty) return res.status(400).json({ success: false, message: 'Head of department faculty not found' });
    }

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
    if ((error as any)?.code === 'P2025') return res.status(404).json({ success: false, message: 'Department not found' });
    if ((error as any)?.code === 'P2002') return res.status(409).json({ success: false, message: 'Department name already exists' });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteDepartment = async (req: Request, res: Response) => {
  try {
    const department = await prisma.department.findUnique({
      where: { id: req.params.id },
      include: { _count: { select: { students: true, faculty: true, courses: true, timetables: true } } }
    });
    if (!department) return res.status(404).json({ success: false, message: 'Department not found' });
    const counts = department._count;
    if (Object.values(counts).some((count) => count > 0)) {
      return res.status(409).json({ success: false, message: 'Cannot delete a department with students, faculty, courses, or timetable entries' });
    }
    await prisma.department.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

import { Request, Response } from 'express';
import prisma from '../config/db';

export const getCourses = async (req: Request, res: Response) => {
  try {
    const { department, semester } = req.query;
    let whereClause: any = {};

    if (department) {
      // department param may be a name string or an ID — resolve to ID
      const dept = await prisma.department.findFirst({
        where: {
          OR: [
            { id: department as string },
            { name: { equals: department as string, mode: 'insensitive' } },
            { code: { equals: department as string, mode: 'insensitive' } },
          ]
        }
      });
      if (dept) whereClause.departmentId = dept.id;
      else whereClause.departmentId = department; // fall back to raw value
    }

    if (semester) whereClause.semester = parseInt(semester as string);

    const courses = await prisma.course.findMany({
      where: whereClause,
      include: { department: true, faculty: { include: { user: true } } }
    });

    const formatted = courses.map(c => ({
      id: c.id,
      code: c.code,
      name: c.name,
      department: c.department.name,
      semester: c.semester,
      credits: c.credits,
      type: c.type,
      description: c.description,
      facultyInstructor: c.faculty?.user.name
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createCourse = async (req: Request, res: Response) => {
  try {
    const { code, name, department, semester, credits, type, description } = req.body;
    
    const course = await prisma.course.create({
      data: {
        code,
        name,
        departmentId: department, // assuming 'department' is an ID
        semester,
        credits,
        type,
        description
      }
    });
    
    res.json(course);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getCourseById = async (req: Request, res: Response) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
      include: { department: true, faculty: { include: { user: true } } }
    });
    if (!course) return res.status(404).json({ success: false, message: 'Not found' });
    
    res.json({
      id: course.id,
      code: course.code,
      name: course.name,
      department: course.department.name,
      semester: course.semester,
      credits: course.credits,
      type: course.type,
      description: course.description,
      facultyInstructor: course.faculty?.user.name
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateCourse = async (req: Request, res: Response) => {
  try {
    const { name, credits, type, description } = req.body;
    const course = await prisma.course.update({
      where: { id: req.params.id },
      data: { name, credits, type, description }
    });
    res.json(course);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

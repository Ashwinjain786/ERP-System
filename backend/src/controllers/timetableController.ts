import { Request, Response } from 'express';
import prisma from '../config/db';

export const getTimetables = async (req: Request, res: Response) => {
  try {
    const { section, semester, department, facultyId } = req.query;

    const whereClause: any = {};
    if (section) whereClause.section = section as string;
    if (semester) whereClause.semester = parseInt(semester as string);
    if (facultyId) whereClause.facultyId = facultyId as string;

    if (department) {
      const dept = await prisma.department.findFirst({
        where: {
          OR: [
            { id: department as string },
            { name: { equals: department as string, mode: 'insensitive' } },
            { code: { equals: department as string, mode: 'insensitive' } },
          ]
        }
      });
      if (dept) {
        whereClause.departmentId = dept.id;
      }
    }

    const entries = await prisma.timetableEntry.findMany({
      where: whereClause,
      include: {
        course: true,
        faculty: { include: { user: true } }
      },
      orderBy: [{ dayOfWeek: 'asc' }, { period: 'asc' }]
    });

    const formatted = entries.map(e => ({
      id: e.id,
      dayOfWeek: e.dayOfWeek,
      period: e.period,
      timeSlot: e.timeSlot,
      subjectCode: e.course.code,
      subjectName: e.course.name,
      facultyName: e.faculty.user.name,
      roomNumber: e.roomNumber,
      section: e.section,
      semester: e.semester,
    }));

    res.json({
      section: (section as string) || (entries[0]?.section ?? 'A'),
      semester: semester ? parseInt(semester as string) : (entries[0]?.semester ?? 1),
      entries: formatted
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const generateTimetable = async (req: Request, res: Response) => {
  try {
    const { department, semester, sections } = req.body;

    let departmentId: string | undefined;
    if (department) {
      const dept = await prisma.department.findFirst({
        where: {
          OR: [
            { id: department },
            { name: { equals: department, mode: 'insensitive' } },
            { code: { equals: department, mode: 'insensitive' } },
          ]
        }
      });
      departmentId = dept?.id;
    }

    const whereClause: any = {};
    if (semester) whereClause.semester = parseInt(semester);
    if (sections && sections.length > 0) whereClause.section = { in: sections };
    if (departmentId) whereClause.departmentId = departmentId;

    const entries = await prisma.timetableEntry.findMany({
      where: whereClause,
      include: {
        course: true,
        faculty: { include: { user: true } }
      },
      orderBy: [{ dayOfWeek: 'asc' }, { period: 'asc' }]
    });

    const formatted = entries.map(e => ({
      id: e.id,
      dayOfWeek: e.dayOfWeek,
      period: e.period,
      timeSlot: e.timeSlot,
      subjectCode: e.course.code,
      subjectName: e.course.name,
      facultyName: e.faculty.user.name,
      roomNumber: e.roomNumber,
      section: e.section,
      semester: e.semester,
    }));

    res.json({
      section: sections ? sections[0] : 'A',
      semester: semester || 1,
      entries: formatted
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

import { Request, Response } from 'express';
import prisma from '../config/db';

export const getTimetables = async (req: Request, res: Response) => {
  try {
    const { section, semester } = req.query;
    
    // In a real app, query based on section and semester
    const entries = await prisma.timetableEntry.findMany({
      include: {
        course: true,
        faculty: { include: { user: true } }
      }
    });
    
    const formatted = entries.map(e => ({
      id: e.id,
      dayOfWeek: e.dayOfWeek,
      period: e.period,
      timeSlot: e.timeSlot,
      subjectCode: e.course.code,
      subjectName: e.course.name,
      facultyName: e.faculty.user.name,
      roomNumber: e.roomNumber
    }));

    res.json({
      section: section || 'A',
      semester: semester ? parseInt(semester as string) : 1,
      entries: formatted
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const generateTimetable = async (req: Request, res: Response) => {
  try {
    const { department, semester, sections } = req.body;
    // Mock successful generation
    res.json({
      section: sections ? sections[0] : 'A',
      semester: semester || 1,
      entries: [] // Return an empty grid for the mock
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

import { Request, Response } from 'express';
import prisma from '../config/db';

export const getExaminations = async (req: Request, res: Response) => {
  try {
    const { semester, status } = req.query;
    let whereClause: any = {};
    if (semester) whereClause.semester = parseInt(semester as string);
    if (status) whereClause.status = status;

    const exams = await prisma.examination.findMany({ where: whereClause });
    res.json(exams);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createExamination = async (req: Request, res: Response) => {
  try {
    const { title, semester, startDate, endDate } = req.body;
    const exam = await prisma.examination.create({
      data: {
        title,
        semester: parseInt(semester as string),
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      }
    });
    res.json(exam);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getExamResults = async (req: Request, res: Response) => {
  try {
    const results = await prisma.examResult.findMany({
      include: {
        student: { include: { user: true } },
        course: true
      }
    });

    const formatted = results.map(r => ({
      id: r.id,
      studentId: r.studentId,
      studentName: r.student.user.name,
      rollNumber: r.student.rollNumber,
      courseCode: r.course.code,
      internalScore: r.internalScore,
      endSemScore: r.endSemScore,
      totalScore: r.totalScore,
      grade: r.grade
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const submitExamResults = async (req: Request, res: Response) => {
  try {
    const { courseCode, section, results } = req.body;
    
    // Find course first
    const course = await prisma.course.findUnique({ where: { code: courseCode } });
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const createManyData = results.map((r: any) => ({
      studentId: r.studentId,
      courseId: course.id,
      internalScore: r.internalScore,
      endSemScore: r.endSemScore,
      totalScore: r.internalScore + r.endSemScore,
      grade: calculateGrade(r.internalScore + r.endSemScore)
    }));

    await prisma.examResult.createMany({ data: createManyData });

    res.json({ success: true, message: 'Results submitted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const calculateGrade = (total: number) => {
  if (total >= 90) return 'A+';
  if (total >= 80) return 'A';
  if (total >= 70) return 'B';
  if (total >= 60) return 'C';
  if (total >= 50) return 'D';
  return 'F';
};

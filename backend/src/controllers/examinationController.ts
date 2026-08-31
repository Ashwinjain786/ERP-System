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
    const { title, semester, startDate, endDate, academicYear } = req.body;
    const exam = await prisma.examination.create({
      data: {
        title,
        semester: parseInt(semester as string),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        academicYear
      }
    });
    res.json(exam);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateExamination = async (req: Request, res: Response) => {
  try {
    const { title, semester, startDate, endDate, academicYear, status } = req.body;
    const data: any = {};
    if (title) data.title = title;
    if (semester) data.semester = parseInt(semester as string);
    if (startDate) data.startDate = new Date(startDate);
    if (endDate) data.endDate = new Date(endDate);
    if (academicYear) data.academicYear = academicYear;
    if (status) data.status = status;

    const exam = await prisma.examination.update({
      where: { id: req.params.id },
      data
    });
    res.json(exam);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteExamination = async (req: Request, res: Response) => {
  try {
    await prisma.examination.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true, message: 'Examination deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const releaseHallTickets = async (req: Request, res: Response) => {
  try {
    const exam = await prisma.examination.update({
      where: { id: req.params.id },
      data: { hallTicketReleased: true }
    });
    res.json({ success: true, message: 'Hall tickets released', data: exam });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getExamResults = async (req: Request, res: Response) => {
  try {
    const { department } = req.query;

    // Verify examination exists
    const exam = await prisma.examination.findUnique({ where: { id: req.params.id } });
    if (!exam) return res.status(404).json({ success: false, message: 'Examination not found' });

    // Filter directly by examinationId (proper FK relation)
    const whereClause: any = { examinationId: req.params.id };

    if (department) {
      const dept = await prisma.department.findFirst({
        where: {
          OR: [
            { id: department as string },
            { name: { equals: department as string, mode: 'insensitive' } },
          ]
        }
      });
      if (dept) whereClause.course = { departmentId: dept.id };
    }

    const results = await prisma.examResult.findMany({
      where: whereClause,
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
      courseName: r.course.name,
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
    const examinationId = req.params.id;

    // Validate examination exists
    const exam = await prisma.examination.findUnique({ where: { id: examinationId } });
    if (!exam) return res.status(404).json({ success: false, message: 'Examination not found' });

    // Find course
    const course = await prisma.course.findUnique({ where: { code: courseCode } });
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const createManyData = results.map((r: any) => ({
      studentId: r.studentId,
      courseId: course.id,
      examinationId,                                              // now properly stored
      internalScore: r.internalScore,
      endSemScore: r.endSemScore,
      totalScore: r.internalScore + r.endSemScore,
      grade: calculateGrade(r.internalScore + r.endSemScore)
    }));

    await prisma.examResult.createMany({
      data: createManyData,
      skipDuplicates: true   // respects @@unique([studentId, courseId, examinationId])
    });

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

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

export const exportExaminations = async (req: Request, res: Response) => {
  try {
    const exams = await prisma.examination.findMany({ orderBy: { startDate: 'desc' } });
    const csvRows = [['ID', 'Title', 'Semester', 'AcademicYear', 'Status', 'Start Date', 'End Date']];
    exams.forEach(e => csvRows.push([
      e.id, `"${e.title}"`, e.semester.toString(), e.academicYear || '', e.status, 
      e.startDate.toISOString().split('T')[0], e.endDate.toISOString().split('T')[0]
    ]));
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="examinations_list.csv"');
    res.send(csvRows.map(r => r.join(",")).join("\n"));
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error exporting examinations' });
  }
};

export const getExamStats = async (req: Request, res: Response) => {
  try {
    const results = await prisma.examResult.findMany({ where: { examinationId: req.params.id } });
    if (results.length === 0) return res.json({ message: 'No results found', passPercentage: 0 });
    
    const passed = results.filter(r => r.totalScore >= 50).length;
    const passPercentage = parseFloat(((passed / results.length) * 100).toFixed(1));
    const averageScore = parseFloat((results.reduce((a, b) => a + b.totalScore, 0) / results.length).toFixed(1));
    
    res.json({ totalStudents: results.length, passed, passPercentage, averageScore });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const downloadExamResults = async (req: Request, res: Response) => {
  try {
    const results = await prisma.examResult.findMany({
      where: { examinationId: req.params.id },
      include: { student: { include: { user: true } }, course: true }
    });
    const csvRows = [['Student Name', 'Roll Number', 'Course', 'Internal', 'EndSem', 'Total', 'Grade']];
    results.forEach(r => csvRows.push([
      `"${r.student.user.name}"`, r.student.rollNumber, `"${r.course.name}"`, 
      r.internalScore?.toString() || '0', r.endSemScore?.toString() || '0', 
      r.totalScore.toString(), r.grade
    ]));
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="exam_results_${req.params.id}.csv"`);
    res.send(csvRows.map(r => r.join(",")).join("\n"));
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error exporting results' });
  }
};

export const remindFaculty = async (req: Request, res: Response) => {
  try {
    const exam = await prisma.examination.findUnique({ where: { id: req.params.id } });
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

    await prisma.notice.create({
      data: {
        title: `URGENT: Upload Results for ${exam.title}`,
        content: `Faculty members are requested to upload the results for ${exam.title} (Semester ${exam.semester}) immediately.`,
        category: 'examination',
        targetRole: 'faculty',
        isUrgent: true,
        publishedBy: (req as any).user?.id
      }
    });

    res.json({ success: true, message: 'Reminder notice sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error sending reminder' });
  }
};

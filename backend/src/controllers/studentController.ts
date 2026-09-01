import { Request, Response } from 'express';
import prisma from '../config/db';
import bcrypt from 'bcryptjs';
import { AuthRequest } from '../middlewares/authMiddleware';

export const getStudents = async (req: Request, res: Response) => {
  try {
    const { department, semester, batch, search } = req.query;
    
    let whereClause: any = {};
    if (department) whereClause.departmentId = department;
    if (semester) whereClause.semester = parseInt(semester as string);
    if (batch) whereClause.batch = batch;
    
    if (search) {
      whereClause.OR = [
        { rollNumber: { contains: search as string, mode: 'insensitive' } },
        { user: { name: { contains: search as string, mode: 'insensitive' } } }
      ];
    }

    const students = await prisma.student.findMany({
      where: whereClause,
      include: {
        user: { select: { name: true, email: true, phone: true, avatarUrl: true } },
        department: { select: { name: true } }
      }
    });

    const formatted = students.map(s => ({
      id: s.id,
      rollNumber: s.rollNumber,
      name: s.user.name,
      email: s.user.email,
      phone: s.user.phone,
      department: s.department.name,
      degree: s.degree,
      semester: s.semester,
      batch: s.batch,
      section: s.section,
      cgpa: s.cgpa,
      attendancePercentage: s.attendancePercentage,
      feeStatus: s.feeStatus,
      feeQuota: s.feeQuota,
      avatarUrl: s.user.avatarUrl
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch students' });
  }
};

export const createStudent = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, department, degree, feeQuota, semester, batch, section } = req.body;

    // Generate roll number (mock logic)
    const rollNumber = `STU${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`;
    const defaultPassword = await bcrypt.hash('student123', 10);

    const student = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: defaultPassword,
        role: 'student',
        studentProfile: {
          create: {
            rollNumber,
            departmentId: department, // Assuming 'department' is an ID
            degree,
            feeQuota,
            semester: semester || 1,
            batch,
            section
          }
        }
      },
      include: {
        studentProfile: { include: { department: true } }
      }
    });

    if (student.studentProfile) {
       res.json({
        id: student.studentProfile.id,
        rollNumber: student.studentProfile.rollNumber,
        name: student.name,
        email: student.email,
        department: student.studentProfile.department.name,
        semester: student.studentProfile.semester
      });
    } else {
       res.status(500).json({ success: false, message: 'Failed to create student profile' });
    }
  } catch (error: any) {
    console.error('Failed to create student:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'A user with this email or phone already exists.' });
    }
    res.status(500).json({ success: false, message: 'Failed to create student', error: error.message });
  }
};

export const getStudentById = async (req: Request, res: Response) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: req.params.id },
      include: { user: true, department: true }
    });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    
    res.json({
      id: student.id,
      rollNumber: student.rollNumber,
      name: student.user.name,
      email: student.user.email,
      phone: student.user.phone,
      department: student.department.name,
      degree: student.degree,
      semester: student.semester,
      batch: student.batch,
      section: student.section,
      cgpa: student.cgpa,
      attendancePercentage: student.attendancePercentage,
      feeStatus: student.feeStatus,
      feeQuota: student.feeQuota,
      avatarUrl: student.user.avatarUrl
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateStudent = async (req: Request, res: Response) => {
  try {
    const { name, phone, semester, section } = req.body;
    
    // First update User part
    const student = await prisma.student.findUnique({ where: { id: req.params.id } });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    await prisma.user.update({
      where: { id: student.userId },
      data: { name, phone }
    });

    const updated = await prisma.student.update({
      where: { id: req.params.id },
      data: { semester, section },
      include: { user: true, department: true }
    });

    res.json({
      id: updated.id,
      name: updated.user.name,
      semester: updated.semester
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update student' });
  }
};

export const getStudentAttendance = async (req: Request, res: Response) => {
  try {
    const records = await prisma.attendanceRecord.findMany({
      where: { studentId: req.params.id },
      include: { course: true }
    });

    const totalLectures = records.length;
    const attendedLectures = records.filter(r => r.status === 'present').length;
    const overallPercentage = totalLectures === 0 ? 0 : (attendedLectures / totalLectures) * 100;

    const courseStats = new Map<string, { course: any; total: number; attended: number }>();
    records.forEach(r => {
      const existing = courseStats.get(r.courseId) || { course: r.course, total: 0, attended: 0 };
      existing.total += 1;
      if (r.status === 'present') existing.attended += 1;
      courseStats.set(r.courseId, existing);
    });

    const detailedRecords = Array.from(courseStats.values()).map(stat => ({
      id: stat.course.id,
      subjectCode: stat.course.code,
      subjectName: stat.course.name,
      totalClasses: stat.total,
      attendedClasses: stat.attended,
      percentage: (stat.attended / stat.total) * 100
    }));

    res.json({
      studentId: req.params.id,
      overallPercentage,
      totalLectures,
      attendedLectures,
      shortageWarning: overallPercentage < 75 && totalLectures > 0,
      records: detailedRecords
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getStudentGrades = async (req: Request, res: Response) => {
  try {
    const results = await prisma.examResult.findMany({
      where: { studentId: req.params.id },
      include: { course: true }
    });
    
    const grouped = new Map<number, typeof results>();
    results.forEach(r => {
      const sem = r.course.semester;
      const arr = grouped.get(sem) || [];
      arr.push(r);
      grouped.set(sem, arr);
    });

    const formatted = Array.from(grouped.entries()).map(([semester, subjects]) => {
      const totalPoints = subjects.reduce((sum, r) => sum + (r.totalScore / 10) * r.course.credits, 0);
      const totalCredits = subjects.reduce((sum, r) => sum + r.course.credits, 0);
      const sgpa = totalCredits > 0 ? (totalPoints / totalCredits) : 0;
      
      return {
        semester,
        academicYear: '2023-24',
        sgpa: Number(sgpa.toFixed(2)),
        cgpa: Number(sgpa.toFixed(2)),
        totalCredits,
        resultStatus: sgpa >= 5 ? 'PASS' : 'FAIL',
        subjects: subjects.map(r => ({
          subjectCode: r.course.code,
          subjectName: r.course.name,
          credits: r.course.credits,
          internalMarks: r.internalScore,
          endSemMarks: r.endSemScore,
          totalMarks: r.totalScore,
          grade: r.grade,
          gradePoint: r.totalScore / 10
        }))
      };
    });
    
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getStudentDocuments = async (req: Request, res: Response) => {
  try {
    const docs = await prisma.documentRequest.findMany({
      where: { studentId: req.params.id }
    });
    res.json(docs);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getStudentFees = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role === 'student') {
      const ownProfile = await prisma.student.findUnique({ where: { userId: req.user.id }, select: { id: true } });
      if (!ownProfile || ownProfile.id !== req.params.id) {
        return res.status(403).json({ success: false, message: 'Students may only view their own fee ledger' });
      }
    }

    const student = await prisma.student.findUnique({
      where: { id: req.params.id },
      include: {
        feeTransactions: { where: { status: 'success' } }
      }
    });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    // Look up the fee structure for this student's program
    const feeStructure = await prisma.feeStructure.findUnique({
      where: { program_quota: { program: student.degree || 'B.Tech', quota: student.feeQuota } },
    });
    if (!feeStructure) {
      return res.status(422).json({ success: false, message: 'No fee structure is configured for this student program' });
    }

    const totalAnnualFee = feeStructure.totalAmount;
    const totalPaid = student.feeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const dueBalance = Math.max(0, totalAnnualFee - totalPaid);
    const calculatedStatus = dueBalance === 0 ? 'paid' : totalPaid > 0 ? 'partial' : 'due';
    if (student.feeStatus !== calculatedStatus) {
      await prisma.student.update({ where: { id: student.id }, data: { feeStatus: calculatedStatus } });
    }

    // Fetch all transactions for the ledger (success + pending)
    const allTransactions = await prisma.feeTransaction.findMany({
      where: { studentId: req.params.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      studentId: req.params.id,
      totalAnnualFee,
      totalPaid,
      dueBalance,
      status: calculatedStatus,
      transactions: allTransactions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const student = await prisma.student.findUnique({ where: { id: req.params.id } });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    // Deleting the user will cascade and delete the student profile
    await prisma.user.delete({ where: { id: student.userId } });

    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete student' });
  }
};

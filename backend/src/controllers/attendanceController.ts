import { Request, Response } from 'express';
import prisma from '../config/db';

export const markAttendance = async (req: Request, res: Response) => {
  try {
    const { courseId, date, period, presentStudentIds, absentStudentIds } = req.body;
    
    // Process present students
    const presentRecords = presentStudentIds.map((id: string) => ({
      studentId: id,
      courseId,
      date: new Date(date),
      period,
      status: 'present' as const
    }));

    // Process absent students
    const absentRecords = (absentStudentIds || []).map((id: string) => ({
      studentId: id,
      courseId,
      date: new Date(date),
      period,
      status: 'absent' as const
    }));

    await prisma.attendanceRecord.createMany({
      data: [...presentRecords, ...absentRecords]
    });

    res.json({ success: true, message: 'Attendance marked successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getAttendanceReport = async (req: Request, res: Response) => {
  try {
    const allRecords = await prisma.attendanceRecord.findMany({
      include: {
        student: {
          include: { department: true }
        }
      }
    });

    if (allRecords.length === 0) {
      return res.json({
        averageAttendance: 0,
        totalStudentsEnrolled: 0,
        defaultersCount: 0,
        departmentAverages: []
      });
    }

    const totalClasses = allRecords.length;
    const attendedClasses = allRecords.filter(r => r.status === 'present').length;
    const averageAttendance = (attendedClasses / totalClasses) * 100;

    const totalStudentsEnrolled = await prisma.student.count();

    const studentStats = new Map<string, { total: number, attended: number }>();
    const departmentStats = new Map<string, { total: number, attended: number }>();

    allRecords.forEach(r => {
      const sStat = studentStats.get(r.studentId) || { total: 0, attended: 0 };
      sStat.total += 1;
      if (r.status === 'present') sStat.attended += 1;
      studentStats.set(r.studentId, sStat);

      const deptName = r.student.department.name;
      const dStat = departmentStats.get(deptName) || { total: 0, attended: 0 };
      dStat.total += 1;
      if (r.status === 'present') dStat.attended += 1;
      departmentStats.set(deptName, dStat);
    });

    let defaultersCount = 0;
    studentStats.forEach(stat => {
      if ((stat.attended / stat.total) * 100 < 75) defaultersCount++;
    });

    const departmentAverages = Array.from(departmentStats.entries()).map(([department, stat]) => ({
      department,
      percentage: (stat.attended / stat.total) * 100
    }));

    res.json({
      averageAttendance,
      totalStudentsEnrolled,
      defaultersCount,
      departmentAverages
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

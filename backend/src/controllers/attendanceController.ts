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
    // Basic mock implementation for aggregate report
    res.json({
      averageAttendance: 85,
      totalStudentsEnrolled: 500,
      defaultersCount: 15,
      departmentAverages: [
        { department: 'Computer Science', percentage: 88 },
        { department: 'Mechanical', percentage: 82 }
      ]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

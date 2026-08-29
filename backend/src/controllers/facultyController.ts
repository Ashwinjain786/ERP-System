import { Request, Response } from 'express';
import prisma from '../config/db';
import bcrypt from 'bcryptjs';

export const getFacultyList = async (req: Request, res: Response) => {
  try {
    const { department, designation } = req.query;
    let whereClause: any = {};
    if (department) whereClause.departmentId = department;
    if (designation) whereClause.designation = designation;

    const faculty = await prisma.faculty.findMany({
      where: whereClause,
      include: {
        user: true,
        department: true
      }
    });

    const formatted = faculty.map(f => ({
      id: f.id,
      employeeCode: f.employeeCode,
      name: f.user.name,
      email: f.user.email,
      phone: f.user.phone,
      department: f.department.name,
      designation: f.designation,
      qualification: f.qualification,
      weeklyWorkloadHours: f.weeklyWorkloadHours,
      leaveBalance: f.leaveBalance,
      avatarUrl: f.user.avatarUrl
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createFaculty = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, department, designation, qualification } = req.body;
    const employeeCode = `FAC${new Date().getFullYear()}${Math.floor(100 + Math.random() * 900)}`;
    const defaultPassword = await bcrypt.hash('faculty123', 10);

    const created = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: defaultPassword,
        role: 'faculty',
        facultyProfile: {
          create: {
            employeeCode,
            departmentId: department,
            designation,
            qualification
          }
        }
      },
      include: { facultyProfile: { include: { department: true } } }
    });

    res.json({
      id: created.facultyProfile?.id,
      employeeCode: created.facultyProfile?.employeeCode,
      name: created.name,
      email: created.email,
      department: created.facultyProfile?.department.name,
      designation: created.facultyProfile?.designation
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getFacultyById = async (req: Request, res: Response) => {
  try {
    const faculty = await prisma.faculty.findUnique({
      where: { id: req.params.id },
      include: { user: true, department: true }
    });
    
    if (!faculty) return res.status(404).json({ success: false, message: 'Not found' });
    
    res.json({
      id: faculty.id,
      employeeCode: faculty.employeeCode,
      name: faculty.user.name,
      email: faculty.user.email,
      phone: faculty.user.phone,
      department: faculty.department.name,
      designation: faculty.designation,
      qualification: faculty.qualification,
      weeklyWorkloadHours: faculty.weeklyWorkloadHours,
      leaveBalance: faculty.leaveBalance,
      avatarUrl: faculty.user.avatarUrl
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateFaculty = async (req: Request, res: Response) => {
  try {
    const { name, phone, designation, qualification } = req.body;
    
    const faculty = await prisma.faculty.findUnique({ where: { id: req.params.id } });
    if (!faculty) return res.status(404).json({ success: false, message: 'Not found' });

    await prisma.user.update({
      where: { id: faculty.userId },
      data: { name, phone }
    });

    const updated = await prisma.faculty.update({
      where: { id: req.params.id },
      data: { designation, qualification },
      include: { user: true }
    });

    res.json({ id: updated.id, name: updated.user.name, designation: updated.designation });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getFacultyWorkload = async (req: Request, res: Response) => {
  try {
    const timetables = await prisma.timetableEntry.findMany({
      where: { facultyId: req.params.id },
      include: { course: true }
    });

    const workloadMap = new Map<string, any>();
    for (const t of timetables) {
      const key = `${t.courseId}-${t.section}`;
      if (!workloadMap.has(key)) {
        const totalStudents = await prisma.student.count({
          where: {
            departmentId: t.course.departmentId,
            semester: t.semester,
            section: t.section
          }
        });

        workloadMap.set(key, {
          courseCode: t.course.code,
          courseName: t.course.name,
          section: t.section,
          hoursPerWeek: 0,
          roomNumber: t.roomNumber,
          totalStudents
        });
      }
      const existing = workloadMap.get(key);
      existing.hoursPerWeek += 1;
      workloadMap.set(key, existing);
    }

    res.json(Array.from(workloadMap.values()));
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getLeaveRequests = async (req: Request, res: Response) => {
  try {
    const leaves = await prisma.leaveRequest.findMany({
      where: { facultyId: req.params.id }
    });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

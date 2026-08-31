import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';

const JWT_SECRET = process.env.JWT_SECRET as string;

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { identifier, password, role } = req.body;
    // For this ERP system, 'identifier' can be email, roll number, or employee code.

    let user;
    
    if (identifier.includes('@')) {
      user = await prisma.user.findUnique({ where: { email: identifier } });
    } else {
      // Find by roll number (student) or employee code (faculty)
      const student = await prisma.student.findUnique({ where: { rollNumber: identifier }, include: { user: true } });
      if (student) user = student.user;
      else {
        const faculty = await prisma.faculty.findUnique({ where: { employeeCode: identifier }, include: { user: true } });
        if (faculty) user = faculty.user;
      }
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Role check if provided
    if (role && user.role !== role) {
      return res.status(403).json({ success: false, message: 'Invalid role for this user' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

    // Fetch full profile so frontend hooks get studentProfile.id / facultyProfile.id immediately
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        phone: true,
        studentProfile: {
          select: {
            id: true,
            rollNumber: true,
            departmentId: true,
            department: { select: { name: true } },
            semester: true,
            section: true,
            degree: true,
            batch: true,
            cgpa: true,
            attendancePercentage: true,
            feeStatus: true,
          }
        },
        facultyProfile: {
          select: {
            id: true,
            employeeCode: true,
            departmentId: true,
            department: { select: { name: true } },
            designation: true,
            qualification: true,
            weeklyWorkloadHours: true,
            leaveBalance: true,
          }
        },
      }
    });

    res.json({
      token,
      user: fullUser,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

export const logoutUser = (req: Request, res: Response) => {
  res.json({ success: true, message: 'Logged out successfully' });
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    // Assuming auth middleware populates req.user
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Not authenticated' });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        phone: true,
        studentProfile: { select: { id: true, rollNumber: true } },
        facultyProfile: { select: { id: true, employeeCode: true } }
      }
    });

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json(user);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

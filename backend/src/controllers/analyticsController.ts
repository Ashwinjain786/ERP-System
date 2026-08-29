import { Request, Response } from 'express';
import prisma from '../config/db';

export const getInstitutionalOverview = async (req: Request, res: Response) => {
  try {
    const [totalStudents, totalFaculty, feeRevResult] = await Promise.all([
      prisma.student.count(),
      prisma.faculty.count(),
      prisma.feeTransaction.aggregate({
        _sum: { amount: true },
        where: { status: 'success' }
      }),
    ]);

    const totalFeeRevenue = feeRevResult._sum.amount || 0;

    // Compute average attendance from AttendanceRecord
    const allRecords = await prisma.attendanceRecord.findMany({ select: { status: true } });
    const totalRecords = allRecords.length;
    const presentRecords = allRecords.filter(r => r.status === 'present').length;
    const averageAttendance = totalRecords > 0 ? parseFloat(((presentRecords / totalRecords) * 100).toFixed(1)) : 0;

    // Compute fee collection rate: students with paid/partial status out of total
    const paidStudents = await prisma.student.count({ where: { feeStatus: { in: ['paid', 'partial'] } } });
    const feeCollectionRate = totalStudents > 0 ? parseFloat(((paidStudents / totalStudents) * 100).toFixed(1)) : 0;

    // Compute placement rate from PlacementRecord
    const placedStudentIds = await prisma.placementRecord.findMany({ select: { studentId: true }, distinct: ['studentId'] });
    const placementRate = totalStudents > 0
      ? parseFloat(((placedStudentIds.length / totalStudents) * 100).toFixed(1))
      : 0;

    res.json({
      totalStudents,
      totalFaculty,
      facultyStudentRatio: totalFaculty > 0 ? `1:${Math.round(totalStudents / totalFaculty)}` : 'N/A',
      averageAttendance,
      totalFeeRevenue,
      feeCollectionRate,
      placementRate,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getAdmissionsAnalytics = async (req: Request, res: Response) => {
  try {
    const apps = await prisma.admissionApplication.findMany();
    const totalApplications = apps.length;
    const admittedStudents = apps.filter(a => a.status === 'approved').length;
    const acceptanceRate = totalApplications > 0 ? parseFloat(((admittedStudents / totalApplications) * 100).toFixed(1)) : 0;

    // Gender ratio: derived from category field if it contains gender info, otherwise N/A
    // AdmissionApplication has no gender field — return null so UI can handle gracefully
    res.json({
      totalApplications,
      admittedStudents,
      acceptanceRate,
      genderRatio: null, // Not tracked in DB schema — no field available
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getAcademicPerformanceAnalytics = async (req: Request, res: Response) => {
  try {
    // Compute from ExamResult
    const results = await prisma.examResult.findMany({
      include: { course: true }
    });

    const totalResults = results.length;
    if (totalResults === 0) {
      return res.json({
        overallPassPercentage: 0,
        medianCGPA: 0,
        backlogRate: 0,
        departmentPassRates: [],
      });
    }

    const passed = results.filter(r => r.totalScore >= 50).length;
    const overallPassPercentage = parseFloat(((passed / totalResults) * 100).toFixed(1));

    // Compute per-student CGPAs
    const studentScores = new Map<string, number[]>();
    results.forEach(r => {
      const arr = studentScores.get(r.studentId) || [];
      arr.push((r.totalScore / 10)); // convert 100-scale to 10-point grade
      studentScores.set(r.studentId, arr);
    });

    const cgpas = Array.from(studentScores.values())
      .map(scores => scores.reduce((a, b) => a + b, 0) / scores.length)
      .sort((a, b) => a - b);

    const mid = Math.floor(cgpas.length / 2);
    const medianCGPA = cgpas.length % 2 !== 0
      ? parseFloat(cgpas[mid].toFixed(2))
      : parseFloat(((cgpas[mid - 1] + cgpas[mid]) / 2).toFixed(2));

    // Backlog: students with any result below 50
    const backlogs = new Set<string>();
    results.forEach(r => { if (r.totalScore < 50) backlogs.add(r.studentId); });
    const backlogRate = studentScores.size > 0
      ? parseFloat(((backlogs.size / studentScores.size) * 100).toFixed(1))
      : 0;

    // Department pass rates
    const deptStats = new Map<string, { total: number; passed: number }>();
    for (const r of results) {
      const deptId = r.course.departmentId;
      const stat = deptStats.get(deptId) || { total: 0, passed: 0 };
      stat.total += 1;
      if (r.totalScore >= 50) stat.passed += 1;
      deptStats.set(deptId, stat);
    }

    // Resolve department IDs to names
    const deptIds = Array.from(deptStats.keys());
    const departments = await prisma.department.findMany({ where: { id: { in: deptIds } } });
    const deptNameMap = new Map(departments.map(d => [d.id, d.name]));

    const departmentPassRates = Array.from(deptStats.entries()).map(([id, stat]) => ({
      department: deptNameMap.get(id) || id,
      passRate: parseFloat(((stat.passed / stat.total) * 100).toFixed(1)),
    }));

    res.json({
      overallPassPercentage,
      medianCGPA,
      backlogRate,
      departmentPassRates,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getPlacementAnalytics = async (req: Request, res: Response) => {
  try {
    const [placements, totalStudents] = await Promise.all([
      prisma.placementRecord.findMany(),
      prisma.student.count(),
    ]);

    const totalOffers = placements.length;
    let highestCTC = 0;
    let totalCTC = 0;

    const recruitersMap = new Map<string, { offers: number; ctc: number }>();

    placements.forEach(p => {
      if (p.ctc > highestCTC) highestCTC = p.ctc;
      totalCTC += p.ctc;

      const r = recruitersMap.get(p.companyName) || { offers: 0, ctc: 0 };
      r.offers += 1;
      r.ctc += p.ctc;
      recruitersMap.set(p.companyName, r);
    });

    const averageCTC = totalOffers > 0 ? totalCTC / totalOffers : 0;

    // Unique placed students
    const placedStudents = new Set(placements.map(p => p.studentId)).size;
    const placementPercentage = totalStudents > 0
      ? parseFloat(((placedStudents / totalStudents) * 100).toFixed(1))
      : 0;

    const topRecruiters = Array.from(recruitersMap.entries())
      .sort((a, b) => b[1].offers - a[1].offers)
      .slice(0, 5)
      .map(([name]) => name);

    res.json({
      placementPercentage,
      averageCTC: averageCTC * 100000, // stored in lakhs, convert to rupees
      highestCTC: highestCTC * 100000,
      topRecruiters,
      totalOffers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

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
    const apps = await prisma.admissionApplication.findMany({ select: { program: true, status: true } });
    const totalApplications = apps.length;
    const admittedStudents = apps.filter(a => a.status === 'approved').length;
    const acceptanceRate = totalApplications > 0 ? parseFloat(((admittedStudents / totalApplications) * 100).toFixed(1)) : 0;

    // Gender ratio: derived from category field if it contains gender info, otherwise N/A
    // AdmissionApplication has no gender field — return null so UI can handle gracefully
    const programMap = new Map<string, { applications: number; admitted: number }>();
    const statusMap = new Map<string, number>();
    apps.forEach((app) => {
      const row = programMap.get(app.program) || { applications: 0, admitted: 0 };
      row.applications += 1;
      if (app.status === 'approved') row.admitted += 1;
      programMap.set(app.program, row);
      statusMap.set(app.status, (statusMap.get(app.status) || 0) + 1);
    });
    res.json({
      totalApplications,
      admittedStudents,
      acceptanceRate,
      programBreakdown: Array.from(programMap, ([program, values]) => ({ program, ...values })),
      statusBreakdown: Array.from(statusMap, ([status, count]) => ({ status, count })),
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
      include: { course: true, student: { include: { user: true, department: true } } }
    });

    const totalResults = results.length;
    if (totalResults === 0) {
      return res.json({
        overallPassPercentage: 0,
        medianCGPA: 0,
        backlogRate: 0,
        departmentPassRates: [],
        cgpaDistribution: [],
        backlogBySemester: [],
        toppers: [],
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

    const cgpaDistribution = [
      { range: '9-10', students: 0 }, { range: '8-9', students: 0 }, { range: '7-8', students: 0 },
      { range: '6-7', students: 0 }, { range: '5-6', students: 0 }, { range: '<5', students: 0 },
    ];
    const studentCgpas = Array.from(studentScores.entries()).map(([studentId, scores]) => ({ studentId, cgpa: scores.reduce((a, b) => a + b, 0) / scores.length }));
    studentCgpas.forEach(({ cgpa }) => {
      const index = cgpa >= 9 ? 0 : cgpa >= 8 ? 1 : cgpa >= 7 ? 2 : cgpa >= 6 ? 3 : cgpa >= 5 ? 4 : 5;
      cgpaDistribution[index].students += 1;
    });
    const backlogBySemesterMap = new Map<number, number>();
    results.forEach((result) => {
      if (result.totalScore < 50) backlogBySemesterMap.set(result.student.semester, (backlogBySemesterMap.get(result.student.semester) || 0) + 1);
    });
    const backlogBySemester = Array.from(backlogBySemesterMap, ([semester, backlogs]) => ({ semester: `Sem ${semester}`, backlogs }));
    const toppers = studentCgpas.sort((a, b) => b.cgpa - a.cgpa).slice(0, 5).map(({ studentId, cgpa }) => {
      const result = results.find((entry) => entry.studentId === studentId)!;
      return { name: result.student.user.name, cgpa: Number(cgpa.toFixed(2)), department: result.student.department.name };
    });

    res.json({
      overallPassPercentage,
      medianCGPA,
      backlogRate,
      departmentPassRates,
      cgpaDistribution,
      backlogBySemester,
      toppers,
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
      .map(([name, values]) => ({ name, offers: values.offers, averageCTC: Number((values.ctc / values.offers).toFixed(2)) }));

    const ctcDistribution = [
      { range: '3-5 LPA', students: placements.filter((p) => p.ctc >= 3 && p.ctc < 5).length },
      { range: '5-8 LPA', students: placements.filter((p) => p.ctc >= 5 && p.ctc < 8).length },
      { range: '8-12 LPA', students: placements.filter((p) => p.ctc >= 8 && p.ctc < 12).length },
      { range: '12-18 LPA', students: placements.filter((p) => p.ctc >= 12 && p.ctc < 18).length },
      { range: '>18 LPA', students: placements.filter((p) => p.ctc >= 18).length },
    ];
    const companyTypeDistribution = Array.from(new Set(placements.map((p) => p.companyType))).map((type) => ({
      type, count: placements.filter((p) => p.companyType === type).length,
    }));
    const trendMap = new Map<number, { placed: Set<string>; offers: number }>();
    placements.forEach((placement) => {
      const year = placement.offerDate.getFullYear();
      const row = trendMap.get(year) || { placed: new Set<string>(), offers: 0 };
      row.placed.add(placement.studentId); row.offers += 1; trendMap.set(year, row);
    });
    const placementTrend = Array.from(trendMap, ([year, values]) => ({ year: String(year), placed: values.placed.size, offers: values.offers }));

    res.json({
      placementPercentage,
      averageCTC: averageCTC * 100000, // stored in lakhs, convert to rupees
      highestCTC: highestCTC * 100000,
      topRecruiters,
      ctcDistribution,
      companyTypeDistribution,
      placementTrend,
      totalOffers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

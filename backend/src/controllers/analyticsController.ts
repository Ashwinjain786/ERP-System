import { Request, Response } from 'express';
import prisma from '../config/db';

export const getInstitutionalOverview = async (req: Request, res: Response) => {
  try {
    const totalStudents = await prisma.student.count();
    const totalFaculty = await prisma.faculty.count();
    
    // In a real application, you'd aggregate real fee transactions
    const totalFeeRevenue = await prisma.feeTransaction.aggregate({
      _sum: { amount: true },
      where: { status: 'success' }
    });

    res.json({
      totalStudents,
      totalFaculty,
      facultyStudentRatio: totalFaculty > 0 ? `1:${Math.round(totalStudents / totalFaculty)}` : 'N/A',
      averageAttendance: 85.5, // mock data
      totalFeeRevenue: totalFeeRevenue._sum.amount || 0,
      feeCollectionRate: 92, // mock data
      placementRate: 88, // mock data
      nirfRankingScore: 78.5, // mock data
      naacGrade: 'A+' // mock data
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
    const acceptanceRate = totalApplications > 0 ? Math.round((admittedStudents / totalApplications) * 100) : 0;
    
    res.json({
      totalApplications,
      admittedStudents,
      acceptanceRate,
      genderRatio: { male: 60, female: 40 } // Gender requires adding to Applicant model if tracked
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getAcademicPerformanceAnalytics = async (req: Request, res: Response) => {
  try {
    res.json({
      overallPassPercentage: 91.5,
      medianCGPA: 8.2,
      backlogRate: 15,
      departmentPassRates: [
        { department: 'Computer Science', passRate: 95 },
        { department: 'Mechanical', passRate: 88 }
      ]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getPlacementAnalytics = async (req: Request, res: Response) => {
  try {
    const placements = await prisma.placementRecord.findMany();

    const totalOffers = placements.length;
    let highestCTC = 0;
    let totalCTC = 0;

    const recruitersMap = new Map<string, { offers: number, ctc: number }>();

    placements.forEach(p => {
      if (p.ctc > highestCTC) highestCTC = p.ctc;
      totalCTC += p.ctc;
      
      const r = recruitersMap.get(p.companyName) || { offers: 0, ctc: 0 };
      r.offers += 1;
      r.ctc += p.ctc;
      recruitersMap.set(p.companyName, r);
    });

    const averageCTC = totalOffers > 0 ? (totalCTC / totalOffers) : 0;
    
    // Sort recruiters by offers
    const topRecruiters = Array.from(recruitersMap.entries())
      .sort((a, b) => b[1].offers - a[1].offers)
      .slice(0, 5)
      .map(([name, _]) => name);

    res.json({
      placementPercentage: 88, // would need total graduating students to calculate exactly
      averageCTC: averageCTC * 100000,
      highestCTC: highestCTC * 100000,
      topRecruiters,
      totalOffers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

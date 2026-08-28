import { useQuery } from '@tanstack/react-query';

import type { InstitutionalMetrics, AdmissionsMetrics, AcademicMetrics, PlacementMetrics } from '@/api/apiInterface';

const MOCK_OVERVIEW: InstitutionalMetrics = {
  totalStudents: 1850,
  totalFaculty: 120,
  facultyStudentRatio: '1:15',
  averageAttendance: 82.5,
  totalFeeRevenue: 285000000,
  feeCollectionRate: 78.5,
  placementRate: 72.3,
  nirfRankingScore: 65,
  naacGrade: 'A',
};

const MOCK_ADMISSIONS: AdmissionsMetrics = {
  totalApplications: 2500,
  admittedStudents: 450,
  acceptanceRate: 18,
  genderRatio: { male: 58, female: 42 },
};

const MOCK_ACADEMIC: AcademicMetrics = {
  overallPassPercentage: 88.5,
  medianCGPA: 7.8,
  backlogRate: 4.2,
  departmentPassRates: [
    { department: 'Computer Science', passRate: 92.5 },
    { department: 'Information Technology', passRate: 89.2 },
    { department: 'Mechanical Engineering', passRate: 85.8 },
    { department: 'Electrical Engineering', passRate: 87.3 },
    { department: 'Civil Engineering', passRate: 84.1 },
  ],
};

const MOCK_PLACEMENT: PlacementMetrics = {
  placementPercentage: 72.3,
  averageCTC: 6.5,
  highestCTC: 18.5,
  topRecruiters: ['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Adobe'],
  totalOffers: 380,
};

export function useInstitutionalOverview() {
  return useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: async () => {
      try {
        return MOCK_OVERVIEW;
      } catch {
        return MOCK_OVERVIEW;
      }
    },
  });
}

export function useAdmissionsAnalytics() {
  return useQuery({
    queryKey: ['analytics', 'admissions'],
    queryFn: async () => {
      try {
        return MOCK_ADMISSIONS;
      } catch {
        return MOCK_ADMISSIONS;
      }
    },
  });
}

export function useAcademicPerformanceAnalytics() {
  return useQuery({
    queryKey: ['analytics', 'academic'],
    queryFn: async () => {
      try {
        return MOCK_ACADEMIC;
      } catch {
        return MOCK_ACADEMIC;
      }
    },
  });
}

export function usePlacementAnalytics() {
  return useQuery({
    queryKey: ['analytics', 'placement'],
    queryFn: async () => {
      try {
        return MOCK_PLACEMENT;
      } catch {
        return MOCK_PLACEMENT;
      }
    },
  });
}

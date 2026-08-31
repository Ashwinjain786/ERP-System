import { useQuery } from '@tanstack/react-query';
import {
  getInstitutionalOverview,
  getAdmissionsAnalytics,
  getAcademicPerformanceAnalytics,
  getPlacementAnalytics,
  getSystemActivity,
  getFinancialHealthAnalytics,
} from '@/api/apiCall';

export function useInstitutionalOverview() {
  return useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: async () => {
      return await getInstitutionalOverview();
    },
  });
}

export function useAdmissionsAnalytics() {
  return useQuery({
    queryKey: ['analytics', 'admissions'],
    queryFn: async () => {
      return await getAdmissionsAnalytics();
    },
  });
}

export function useAcademicPerformanceAnalytics() {
  return useQuery({
    queryKey: ['analytics', 'academic'],
    queryFn: async () => {
      return await getAcademicPerformanceAnalytics();
    },
  });
}

export function usePlacementAnalytics() {
  return useQuery({
    queryKey: ['analytics', 'placement'],
    queryFn: async () => {
      return await getPlacementAnalytics();
    },
  });
}

export function useSystemActivity() {
  return useQuery({
    queryKey: ['analytics', 'activity'],
    queryFn: async () => {
      return await getSystemActivity();
    },
    refetchInterval: 30000
  });
}

export function useFinancialHealthAnalytics() {
  return useQuery({
    queryKey: ['analytics', 'financialHealth'],
    queryFn: async () => {
      return await getFinancialHealthAnalytics();
    },
  });
}

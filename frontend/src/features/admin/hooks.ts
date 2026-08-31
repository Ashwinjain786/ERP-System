import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getStudents,
  getFacultyList,
  getDepartments,
  getCourses,
  getNotices,
  getFeeStructures,
  getFeeTransactions,
  getFeeDefaulters,
  getExaminations,
  getInstitutionalOverview,
  createDepartment, updateDepartment, deleteDepartment,
} from '@/api/apiCall';
import type { DepartmentInput } from '@/api/apiInterface';

export function useStudentsList() {
  return useQuery({
    queryKey: ['admin', 'students'],
    queryFn: async () => {
      return await getStudents({});
    },
  });
}

export function useFacultyList() {
  return useQuery({
    queryKey: ['admin', 'faculty'],
    queryFn: async () => {
      return await getFacultyList({});
    },
  });
}

export function useDepartments() {
  return useQuery({
    queryKey: ['admin', 'departments'],
    queryFn: async () => {
      return await getDepartments();
    },
  });
}

export function useDepartmentMutations() {
  const queryClient = useQueryClient();
  return {
    create: useMutation({ mutationFn: createDepartment, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'departments'] }) }),
    update: useMutation({ mutationFn: ({ id, ...input }: { id: string } & DepartmentInput) => updateDepartment(id, input), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'departments'] }) }),
    remove: useMutation({ mutationFn: deleteDepartment, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'departments'] }) }),
  };
}

export function useCourses() {
  return useQuery({
    queryKey: ['admin', 'courses'],
    queryFn: async () => {
      return await getCourses({});
    },
  });
}

export function useNotices() {
  return useQuery({
    queryKey: ['admin', 'notices'],
    queryFn: async () => {
      return await getNotices({});
    },
  });
}

export function useFeeStructures() {
  return useQuery({
    queryKey: ['admin', 'fee-structures'],
    queryFn: async () => {
      return await getFeeStructures();
    },
  });
}

export function useFeeTransactions() {
  return useQuery({
    queryKey: ['admin', 'fee-transactions'],
    queryFn: async () => {
      return await getFeeTransactions({});
    },
  });
}

export function useFeeDefaulters() {
  return useQuery({
    queryKey: ['admin', 'fee-defaulters'],
    queryFn: async () => {
      return await getFeeDefaulters({});
    },
  });
}

export function useExaminations() {
  return useQuery({
    queryKey: ['admin', 'examinations'],
    queryFn: async () => {
      return await getExaminations({});
    },
  });
}

export function useInstitutionalMetrics() {
  return useQuery({
    queryKey: ['admin', 'metrics'],
    queryFn: async () => {
      return await getInstitutionalOverview();
    },
  });
}

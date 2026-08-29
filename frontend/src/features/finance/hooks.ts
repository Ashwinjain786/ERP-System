import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createFeeStructure,
  getFeeStructures,
  getFeeTransactions,
  getFeeDefaulters,
  updateFeeTransactionStatus,
} from '@/api/apiCall';
import type { FeeStructureInput, UpdateFeeTransactionStatusInput } from '@/api/apiInterface';

export function useFeeStructures() {
  return useQuery({
    queryKey: ['finance', 'fee-structures'],
    queryFn: async () => {
      return await getFeeStructures();
    },
  });
}

export function useFeeTransactions() {
  return useQuery({
    queryKey: ['finance', 'transactions'],
    queryFn: async () => {
      return await getFeeTransactions({});
    },
  });
}

export function useFeeDefaulters() {
  return useQuery({
    queryKey: ['finance', 'defaulters'],
    queryFn: async () => {
      return await getFeeDefaulters({});
    },
  });
}

export function useCreateFeeStructure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: FeeStructureInput) => createFeeStructure(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'fee-structures'] }),
  });
}

export function useUpdateFeeTransactionStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateFeeTransactionStatusInput) => updateFeeTransactionStatus(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'transactions'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'defaulters'] });
    },
  });
}

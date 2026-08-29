import { useQuery } from '@tanstack/react-query';
import {
  getFeeStructures,
  getFeeTransactions,
  getFeeDefaulters,
} from '@/api/apiCall';

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

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getLibraryBooks,
  getLibraryFines,
  createLibraryBook,
  issueLibraryBook,
  returnLibraryBook,
} from '@/api/apiCall';
import { getLibraryCirculation, payLibraryFine } from '@/api/customApi';
import type { CirculationRecord, CreateLibraryBookInput, IssueLibraryBookInput, ReturnLibraryBookInput } from '@/api/apiInterface';

export function useLibraryBooks() {
  return useQuery({
    queryKey: ['library', 'books'],
    queryFn: async () => {
      return await getLibraryBooks({});
    },
  });
}


export function useCirculationRecords() {
  return useQuery({
    queryKey: ['library', 'circulation'],
    queryFn: async () => {
      const data = await getLibraryCirculation();
      return (data || []) as CirculationRecord[];
    },
  });
}

export function useLibraryFines() {
  return useQuery({
    queryKey: ['library', 'fines'],
    queryFn: async () => {
      // Usually would pass user ID, but omitting gets all or backend errors out depending on implementation
      return await getLibraryFines({});
    },
  });
}

function invalidateLibraryQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['library'] });
  queryClient.invalidateQueries({ queryKey: ['student', 'library'] });
}

export function useCreateLibraryBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateLibraryBookInput) => createLibraryBook(input),
    onSuccess: () => invalidateLibraryQueries(queryClient),
  });
}

export function useIssueLibraryBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: IssueLibraryBookInput) => issueLibraryBook(input),
    onSuccess: () => invalidateLibraryQueries(queryClient),
  });
}

export function useReturnLibraryBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ReturnLibraryBookInput) => returnLibraryBook(input),
    onSuccess: () => invalidateLibraryQueries(queryClient),
  });
}

export function usePayLibraryFine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (fineId: string) => payLibraryFine(fineId),
    onSuccess: () => invalidateLibraryQueries(queryClient),
  });
}

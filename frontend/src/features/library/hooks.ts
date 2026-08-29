import { useQuery } from '@tanstack/react-query';
import {
  getLibraryBooks,
  getLibraryFines,
} from '@/api/apiCall';
import { getLibraryCirculation } from '@/api/customApi';
import type { CirculationRecord } from '@/api/apiInterface';

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

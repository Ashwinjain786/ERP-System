import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import {
  getFacultyById,
  getFacultyWorkload,
  getStudents,
  getCourses,
} from '@/api/apiCall';

type ProfileUser = {
  facultyProfile?: {
    id?: string;
  };
};

function getFacultyId(user: unknown) {
  return (user as ProfileUser | null | undefined)?.facultyProfile?.id;
}

export function useFacultyProfile() {
  const { user } = useAuth();
  const facultyId = getFacultyId(user);

  return useQuery({
    queryKey: ['faculty', 'profile', facultyId],
    queryFn: async () => {
      if (!facultyId) throw new Error('No faculty profile found');
      return await getFacultyById({ id: facultyId });
    },
    enabled: !!facultyId,
  });
}

export function useFacultyWorkload() {
  const { user } = useAuth();
  const facultyId = getFacultyId(user);

  return useQuery({
    queryKey: ['faculty', 'workload', facultyId],
    queryFn: async () => {
      if (!facultyId) throw new Error('No faculty profile found');
      return await getFacultyWorkload({ id: facultyId });
    },
    enabled: !!facultyId,
  });
}

export function useFacultyAttendance() {
  return useQuery({
    queryKey: ['faculty', 'attendance'],
    queryFn: async () => {
      // Backend does not seem to have a dedicated endpoint for faculty attendance yet.
      return [];
    },
  });
}

export function useFacultyStudents() {
  const { data: profile } = useFacultyProfile();

  return useQuery({
    queryKey: ['faculty', 'students', profile?.department],
    queryFn: async () => {
      return await getStudents({ department: profile?.department });
    },
    enabled: !!profile?.department,
  });
}

export function useFacultyCourses() {
  const { data: profile } = useFacultyProfile();

  return useQuery({
    queryKey: ['faculty', 'courses', profile?.department],
    queryFn: async () => {
      return await getCourses({ department: profile?.department });
    },
    enabled: !!profile?.department,
  });
}

import { apiConfig } from './apiCall';

async function fetchWithConfig(path: string, options: RequestInit = {}) {
  const url = `${apiConfig.baseUrl}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...apiConfig.headers,
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Admin
export const getAdmissions = () => fetchWithConfig('/admin/admissions');
export const getRoles = () => fetchWithConfig('/admin/roles');

// Faculty
export const getFacultyLeaves = () => fetchWithConfig('/faculty/leaves');
export const getFacultyGrading = () => fetchWithConfig('/faculty/grading');
export const getFacultyClasses = () => fetchWithConfig('/faculty/classes');
export const getFacultyAttendance = () => fetchWithConfig('/faculty/attendance');
export const getFacultyDepartment = () => fetchWithConfig('/faculty/department');

// Student
export const getStudentDocuments = () => fetchWithConfig('/student/documents');

// General
export const getAllTimetables = () => fetchWithConfig('/timetable/all');
export const getAllNotices = () => fetchWithConfig('/notice/all');
export const getAllExaminations = () => fetchWithConfig('/examination/all');
export const getAcademics = () => fetchWithConfig('/department/all');

// Library
export const getLibraryCirculation = (borrowerId?: string) => 
  fetchWithConfig(`/library/circulation${borrowerId ? `?borrowerId=${borrowerId}` : ''}`);

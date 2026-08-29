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

// Faculty (require :id — callers must pass facultyId)
export const getFacultyLeaves = (facultyId: string) =>
  fetchWithConfig(`/faculty/${facultyId}/leaves`);

// Library
export const getLibraryCirculation = (borrowerId?: string) =>
  fetchWithConfig(`/library/circulation${borrowerId ? `?borrowerId=${borrowerId}` : ''}`);

export const payLibraryFine = (fineId: string) =>
  fetchWithConfig(`/library/fines/${encodeURIComponent(fineId)}/pay`, { method: 'POST' });

// General
export const getAllTimetables = (params?: { section?: string; semester?: number; department?: string }) => {
  const qs = params
    ? '?' + new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)])
      ).toString()
    : '';
  return fetchWithConfig(`/timetables${qs}`);
};

export const getAllNotices = (targetRole?: string) =>
  fetchWithConfig(`/notices${targetRole ? `?targetRole=${targetRole}` : ''}`);

export const getAllExaminations = (params?: { semester?: number; status?: string }) => {
  const qs = params
    ? '?' + new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)])
      ).toString()
    : '';
  return fetchWithConfig(`/examinations${qs}`);
};

export const getAcademics = () => fetchWithConfig('/departments');

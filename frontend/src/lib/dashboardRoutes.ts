const ROLE_DASHBOARD_PATHS: Record<string, string> = {
  student: '/student',
  faculty: '/faculty',
  hod: '/faculty',
  admin: '/admin',
  finance_officer: '/finance',
  librarian: '/library',
  management: '/analytics',
};

export const getDashboardPath = (role?: string) => ROLE_DASHBOARD_PATHS[role || ''] || '/login';

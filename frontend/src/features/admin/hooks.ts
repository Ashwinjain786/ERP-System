import { useQuery } from '@tanstack/react-query';

import type {
  Student,
  Faculty,
  Department,
  Course,
  Notice,
  FeeStructure,
  FeeTransaction,
  FeeDefaulter,
  Examination,
  InstitutionalMetrics,
} from '@/api/apiInterface';

const MOCK_STUDENTS: Student[] = [
  { id: 'stu-001', rollNumber: '22CS001', name: 'Aryan Sharma', email: 'aryan@campusone.edu', department: 'Computer Science', semester: 4, batch: '2022-2026', cgpa: 8.75, attendancePercentage: 87.5, feeStatus: 'paid' },
  { id: 'stu-002', rollNumber: '22CS002', name: 'Priya Singh', email: 'priya@campusone.edu', department: 'Computer Science', semester: 4, batch: '2022-2026', cgpa: 9.2, attendancePercentage: 92, feeStatus: 'paid' },
  { id: 'stu-003', rollNumber: '22IT001', name: 'Rahul Verma', email: 'rahul@campusone.edu', department: 'Information Technology', semester: 4, batch: '2022-2026', cgpa: 7.85, attendancePercentage: 78, feeStatus: 'partial' },
  { id: 'stu-004', rollNumber: '22ME001', name: 'Ankit Patel', email: 'ankit@campusone.edu', department: 'Mechanical Engineering', semester: 4, batch: '2022-2026', cgpa: 8.1, attendancePercentage: 82, feeStatus: 'paid' },
  { id: 'stu-005', rollNumber: '22EE001', name: 'Sneha Reddy', email: 'sneha@campusone.edu', department: 'Electrical Engineering', semester: 4, batch: '2022-2026', cgpa: 8.95, attendancePercentage: 95, feeStatus: 'paid' },
  { id: 'stu-006', rollNumber: '22CS003', name: 'Karthik Nair', email: 'karthik@campusone.edu', department: 'Computer Science', semester: 4, batch: '2022-2026', cgpa: 6.5, attendancePercentage: 68, feeStatus: 'due' },
];

const MOCK_FACULTY: Faculty[] = [
  { id: 'fac-001', employeeCode: 'FAC001', name: 'Dr. Priya Menon', email: 'priya.menon@campusone.edu', department: 'Computer Science', designation: 'Associate Professor', qualification: 'Ph.D.', weeklyWorkloadHours: 18, leaveBalance: 12 },
  { id: 'fac-002', employeeCode: 'FAC002', name: 'Prof. Rajesh Kumar', email: 'rajesh.kumar@campusone.edu', department: 'Computer Science', designation: 'Professor', qualification: 'Ph.D.', weeklyWorkloadHours: 16, leaveBalance: 8 },
  { id: 'fac-003', employeeCode: 'FAC003', name: 'Dr. Ankit Sharma', email: 'ankit.sharma@campusone.edu', department: 'Information Technology', designation: 'Assistant Professor', qualification: 'M.Tech', weeklyWorkloadHours: 20, leaveBalance: 15 },
  { id: 'fac-004', employeeCode: 'FAC004', name: 'Ms. Kavita Iyer', email: 'kavita.iyer@campusone.edu', department: 'Computer Science', designation: 'Assistant Professor', qualification: 'M.Tech', weeklyWorkloadHours: 14, leaveBalance: 10 },
];

const MOCK_DEPARTMENTS: Department[] = [
  { id: 'dept-001', code: 'CS', name: 'Computer Science', headOfDepartment: 'Dr. Priya Menon', facultyCount: 25, studentCount: 450 },
  { id: 'dept-002', code: 'IT', name: 'Information Technology', headOfDepartment: 'Dr. Ramesh Babu', facultyCount: 18, studentCount: 280 },
  { id: 'dept-003', code: 'ME', name: 'Mechanical Engineering', headOfDepartment: 'Prof. Suresh Reddy', facultyCount: 22, studentCount: 320 },
  { id: 'dept-004', code: 'EE', name: 'Electrical Engineering', headOfDepartment: 'Dr. Lakshmi Devi', facultyCount: 20, studentCount: 290 },
  { id: 'dept-005', code: 'CE', name: 'Civil Engineering', headOfDepartment: 'Prof. Venkatesh', facultyCount: 15, studentCount: 180 },
];

const MOCK_COURSES: Course[] = [
  { id: 'cs-301', code: 'CS301', name: 'Database Management Systems', department: 'Computer Science', semester: 4, credits: 4, type: 'theory', facultyInstructor: 'Dr. Priya Menon' },
  { id: 'cs-302', code: 'CS302', name: 'Operating Systems', department: 'Computer Science', semester: 4, credits: 4, type: 'theory', facultyInstructor: 'Prof. Rajesh Kumar' },
  { id: 'cs-303', code: 'CS303', name: 'Computer Networks', department: 'Computer Science', semester: 4, credits: 3, type: 'theory', facultyInstructor: 'Dr. Ankit Sharma' },
  { id: 'cs-304', code: 'CS304', name: 'Software Engineering', department: 'Computer Science', semester: 4, credits: 3, type: 'theory', facultyInstructor: 'Ms. Kavita Iyer' },
];

const MOCK_NOTICES: Notice[] = [
  { id: '1', title: 'Mid-Semester Examination Schedule', content: 'Examinations from March 15-25, 2024', category: 'examination', targetRole: 'all', publishedAt: '2024-02-28T10:00:00Z', publishedBy: 'Dr. Rajesh Kumar', isUrgent: true },
  { id: '2', title: 'Annual Tech Fest Registration', content: 'Innovate 2024 registrations open', category: 'events', targetRole: 'student', publishedAt: '2024-02-25T14:30:00Z', publishedBy: 'Student Council' },
  { id: '3', title: 'Faculty Meeting - March 5', content: 'All faculty members must attend', category: 'academic', targetRole: 'faculty', publishedAt: '2024-02-20T09:00:00Z', publishedBy: 'Principal' },
];

const MOCK_FEE_STRUCTURES: FeeStructure[] = [
  { id: 'fs-001', program: 'B.Tech', quota: 'general', tuitionFee: 120000, hostelFee: 40000, examFee: 5000, libraryDeposit: 5000, totalAmount: 170000, dueDate: '2024-07-31' },
  { id: 'fs-002', program: 'B.Tech', quota: 'management', tuitionFee: 180000, hostelFee: 40000, examFee: 5000, libraryDeposit: 5000, totalAmount: 230000, dueDate: '2024-07-31' },
  { id: 'fs-003', program: 'M.Tech', quota: 'general', tuitionFee: 80000, hostelFee: 30000, examFee: 3000, libraryDeposit: 3000, totalAmount: 116000, dueDate: '2024-07-31' },
];

const MOCK_TRANSACTIONS: FeeTransaction[] = [
  { id: 'txn-001', receiptNumber: 'REC2024001', studentId: 'stu-001', studentName: 'Aryan Sharma', amount: 75000, paymentMethod: 'UPI', status: 'success', paidAt: '2024-04-15T10:30:00Z' },
  { id: 'txn-002', receiptNumber: 'REC2024002', studentId: 'stu-002', studentName: 'Priya Singh', amount: 85000, paymentMethod: 'NetBanking', status: 'success', paidAt: '2024-04-16T11:20:00Z' },
  { id: 'txn-003', receiptNumber: 'REC2024003', studentId: 'stu-003', studentName: 'Rahul Verma', amount: 50000, paymentMethod: 'Challan', status: 'pending', paidAt: '2024-04-17T09:15:00Z' },
];

const MOCK_DEFAULTERS: FeeDefaulter[] = [
  { studentId: 'stu-006', rollNumber: '22CS003', name: 'Karthik Nair', department: 'Computer Science', semester: 4, dueAmount: 85000, daysOverdue: 45 },
  { studentId: 'stu-007', rollNumber: '22ME002', name: 'Vikram Singh', department: 'Mechanical Engineering', semester: 4, dueAmount: 120000, daysOverdue: 60 },
  { studentId: 'stu-008', rollNumber: '22IT002', name: 'Aditya Joshi', department: 'Information Technology', semester: 4, dueAmount: 55000, daysOverdue: 30 },
];

const MOCK_EXAMINATIONS: Examination[] = [
  { id: '1', title: 'Mid-Semester I', academicYear: '2023-24', semester: 4, startDate: '2024-03-15', endDate: '2024-03-25', status: 'upcoming', hallTicketReleased: false },
  { id: '2', title: 'End-Semester', academicYear: '2023-24', semester: 4, startDate: '2024-05-01', endDate: '2024-05-15', status: 'upcoming', hallTicketReleased: false },
];

const MOCK_METRICS: InstitutionalMetrics = {
  totalStudents: 1850,
  totalFaculty: 120,
  facultyStudentRatio: '1:15',
  averageAttendance: 82.5,
  totalFeeRevenue: 285000000,
  feeCollectionRate: 78.5,
  placementRate: 72.3,
  nirfRankingScore: 65,
  naacGrade: 'A',
};

export function useStudentsList() {
  return useQuery({
    queryKey: ['admin', 'students'],
    queryFn: async () => {
      try {
        return MOCK_STUDENTS;
      } catch {
        return MOCK_STUDENTS;
      }
    },
  });
}

export function useFacultyList() {
  return useQuery({
    queryKey: ['admin', 'faculty'],
    queryFn: async () => {
      try {
        return MOCK_FACULTY;
      } catch {
        return MOCK_FACULTY;
      }
    },
  });
}

export function useDepartments() {
  return useQuery({
    queryKey: ['admin', 'departments'],
    queryFn: async () => {
      try {
        return MOCK_DEPARTMENTS;
      } catch {
        return MOCK_DEPARTMENTS;
      }
    },
  });
}

export function useCourses() {
  return useQuery({
    queryKey: ['admin', 'courses'],
    queryFn: async () => {
      try {
        return MOCK_COURSES;
      } catch {
        return MOCK_COURSES;
      }
    },
  });
}

export function useNotices() {
  return useQuery({
    queryKey: ['admin', 'notices'],
    queryFn: async () => {
      try {
        return MOCK_NOTICES;
      } catch {
        return MOCK_NOTICES;
      }
    },
  });
}

export function useFeeStructures() {
  return useQuery({
    queryKey: ['admin', 'fee-structures'],
    queryFn: async () => {
      try {
        return MOCK_FEE_STRUCTURES;
      } catch {
        return MOCK_FEE_STRUCTURES;
      }
    },
  });
}

export function useFeeTransactions() {
  return useQuery({
    queryKey: ['admin', 'fee-transactions'],
    queryFn: async () => {
      try {
        return MOCK_TRANSACTIONS;
      } catch {
        return MOCK_TRANSACTIONS;
      }
    },
  });
}

export function useFeeDefaulters() {
  return useQuery({
    queryKey: ['admin', 'fee-defaulters'],
    queryFn: async () => {
      try {
        return MOCK_DEFAULTERS;
      } catch {
        return MOCK_DEFAULTERS;
      }
    },
  });
}

export function useExaminations() {
  return useQuery({
    queryKey: ['admin', 'examinations'],
    queryFn: async () => {
      try {
        return MOCK_EXAMINATIONS;
      } catch {
        return MOCK_EXAMINATIONS;
      }
    },
  });
}

export function useInstitutionalMetrics() {
  return useQuery({
    queryKey: ['admin', 'metrics'],
    queryFn: async () => {
      try {
        return MOCK_METRICS;
      } catch {
        return MOCK_METRICS;
      }
    },
  });
}

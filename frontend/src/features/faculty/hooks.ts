import { useQuery } from '@tanstack/react-query';

import type {
  Faculty,
  WorkloadAssignment,
  AttendanceRecord,
  Course,
  Student,
} from '@/api/apiInterface';

const MOCK_FACULTY: Faculty = {
  id: 'fac-001',
  employeeCode: 'FAC001',
  name: 'Dr. Priya Menon',
  email: 'priya.menon@campusone.edu',
  phone: '+91 98765 43210',
  department: 'Computer Science',
  designation: 'Associate Professor',
  qualification: 'Ph.D. in Computer Science',
  weeklyWorkloadHours: 18,
  leaveBalance: 12,
};

const MOCK_WORKLOAD: WorkloadAssignment[] = [
  { id: '1', courseCode: 'CS301', courseName: 'Database Management Systems', section: 'A', hoursPerWeek: 4, roomNumber: 'CR-101', totalStudents: 65 },
  { id: '2', courseCode: 'CS301', courseName: 'Database Management Systems', section: 'B', hoursPerWeek: 4, roomNumber: 'CR-102', totalStudents: 60 },
  { id: '3', courseCode: 'CS305', courseName: 'Web Development Lab', section: 'A', hoursPerWeek: 3, roomNumber: 'Lab-201', totalStudents: 30 },
  { id: '4', courseCode: 'CS501', courseName: 'Advanced Database', section: 'A', hoursPerWeek: 3, roomNumber: 'CR-201', totalStudents: 25 },
];

const MOCK_ATTENDANCE_RECORDS: AttendanceRecord[] = [
  { id: '1', subjectCode: 'CS301', subjectName: 'Database Management Systems', totalClasses: 35, attendedClasses: 32, percentage: 91.4 },
  { id: '2', subjectCode: 'CS305', subjectName: 'Web Development Lab', totalClasses: 20, attendedClasses: 19, percentage: 95 },
];

const MOCK_STUDENTS: Student[] = [
  { id: 'stu-001', rollNumber: '22CS001', name: 'Aryan Sharma', email: 'aryan@campusone.edu', department: 'Computer Science', semester: 4, cgpa: 8.75 },
  { id: 'stu-002', rollNumber: '22CS002', name: 'Priya Singh', email: 'priya@campusone.edu', department: 'Computer Science', semester: 4, cgpa: 9.2 },
  { id: 'stu-003', rollNumber: '22CS003', name: 'Rahul Verma', email: 'rahul@campusone.edu', department: 'Computer Science', semester: 4, cgpa: 7.85 },
  { id: 'stu-004', rollNumber: '22CS004', name: 'Ankit Patel', email: 'ankit@campusone.edu', department: 'Computer Science', semester: 4, cgpa: 8.1 },
  { id: 'stu-005', rollNumber: '22CS005', name: 'Sneha Reddy', email: 'sneha@campusone.edu', department: 'Computer Science', semester: 4, cgpa: 8.95 },
];

const MOCK_COURSES: Course[] = [
  { id: 'cs-301', code: 'CS301', name: 'Database Management Systems', department: 'Computer Science', semester: 4, credits: 4, type: 'theory', description: 'Fundamentals of relational database design and SQL', facultyInstructor: 'Dr. Priya Menon' },
  { id: 'cs-305', code: 'CS305', name: 'Web Development Lab', department: 'Computer Science', semester: 4, credits: 2, type: 'lab', description: 'Practical web development with React and Node.js', facultyInstructor: 'Dr. Priya Menon' },
];

export function useFacultyProfile() {
  return useQuery({
    queryKey: ['faculty', 'profile'],
    queryFn: async () => {
      try {
        return MOCK_FACULTY;
      } catch {
        return MOCK_FACULTY;
      }
    },
  });
}

export function useFacultyWorkload() {
  return useQuery({
    queryKey: ['faculty', 'workload'],
    queryFn: async () => {
      try {
        return MOCK_WORKLOAD;
      } catch {
        return MOCK_WORKLOAD;
      }
    },
  });
}

export function useFacultyAttendance() {
  return useQuery({
    queryKey: ['faculty', 'attendance'],
    queryFn: async () => {
      try {
        return MOCK_ATTENDANCE_RECORDS;
      } catch {
        return MOCK_ATTENDANCE_RECORDS;
      }
    },
  });
}

export function useFacultyStudents() {
  return useQuery({
    queryKey: ['faculty', 'students'],
    queryFn: async () => {
      try {
        return MOCK_STUDENTS;
      } catch {
        return MOCK_STUDENTS;
      }
    },
  });
}

export function useFacultyCourses() {
  return useQuery({
    queryKey: ['faculty', 'courses'],
    queryFn: async () => {
      try {
        return MOCK_COURSES;
      } catch {
        return MOCK_COURSES;
      }
    },
  });
}

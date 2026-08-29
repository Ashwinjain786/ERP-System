import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import type { 
  Student, 
  AttendanceSummary, 
  GradeCard, 
  StudentFeeLedger,
  Course,
  TimetableGrid,
  Notice,
  CirculationRecord,
  Examination
} from '@/api/apiInterface';
import { getStudentById, getStudentAttendance, getStudentGrades, getStudentFees, getCourses, getTimetables, getNotices } from '@/api/apiCall';

const MOCK_STUDENT: Student = {
  id: 'stu-001',
  rollNumber: '22CS001',
  name: 'Aryan Sharma',
  email: 'aryan.sharma@campusone.edu',
  phone: '+91 98765 43210',
  department: 'Computer Science',
  degree: 'B.Tech',
  semester: 4,
  batch: '2022-2026',
  section: 'A',
  cgpa: 8.75,
  attendancePercentage: 87.5,
  feeStatus: 'paid',
};

const MOCK_ATTENDANCE: AttendanceSummary = {
  studentId: 'stu-001',
  overallPercentage: 87.5,
  totalLectures: 120,
  attendedLectures: 105,
  shortageWarning: false,
  records: [
    { id: '1', subjectCode: 'CS301', subjectName: 'Database Management Systems', totalClasses: 40, attendedClasses: 36, percentage: 90 },
    { id: '2', subjectCode: 'CS302', subjectName: 'Operating Systems', totalClasses: 40, attendedClasses: 35, percentage: 87.5 },
    { id: '3', subjectCode: 'CS303', subjectName: 'Computer Networks', totalClasses: 40, attendedClasses: 34, percentage: 85 },
    { id: '4', subjectCode: 'CS304', subjectName: 'Software Engineering', totalClasses: 40, attendedClasses: 30, percentage: 75 },
  ],
};

const MOCK_GRADES: GradeCard[] = [
  {
    semester: 1,
    academicYear: '2022-23',
    sgpa: 8.2,
    cgpa: 8.2,
    totalCredits: 20,
    resultStatus: 'PASS',
    subjects: [
      { subjectCode: 'CS101', subjectName: 'Programming Fundamentals', credits: 4, internalMarks: 85, endSemMarks: 78, totalMarks: 163, grade: 'A', gradePoint: 9 },
      { subjectCode: 'CS102', subjectName: 'Digital Logic', credits: 3, internalMarks: 80, endSemMarks: 72, totalMarks: 152, grade: 'A', gradePoint: 9 },
    ],
  },
  {
    semester: 2,
    academicYear: '2022-23',
    sgpa: 8.5,
    cgpa: 8.35,
    totalCredits: 22,
    resultStatus: 'PASS',
    subjects: [
      { subjectCode: 'CS201', subjectName: 'Data Structures', credits: 4, internalMarks: 88, endSemMarks: 80, totalMarks: 168, grade: 'A+', gradePoint: 10 },
    ],
  },
  {
    semester: 3,
    academicYear: '2023-24',
    sgpa: 8.8,
    cgpa: 8.5,
    totalCredits: 21,
    resultStatus: 'PASS',
    subjects: [
      { subjectCode: 'CS301', subjectName: 'Database Management Systems', credits: 4, internalMarks: 90, endSemMarks: 85, totalMarks: 175, grade: 'A+', gradePoint: 10 },
    ],
  },
];

const MOCK_FEES: StudentFeeLedger = {
  studentId: 'stu-001',
  totalAnnualFee: 150000,
  totalPaid: 150000,
  dueBalance: 0,
  status: 'paid',
  transactions: [
    { id: 'txn-001', receiptNumber: 'REC2024001', studentId: 'stu-001', studentName: 'Aryan Sharma', amount: 75000, paymentMethod: 'UPI', status: 'success', paidAt: '2024-04-15T10:30:00Z' },
    { id: 'txn-002', receiptNumber: 'REC2024002', studentId: 'stu-001', studentName: 'Aryan Sharma', amount: 75000, paymentMethod: 'NetBanking', status: 'success', paidAt: '2024-09-10T14:20:00Z' },
  ],
};

const MOCK_COURSES: Course[] = [
  { id: 'cs-301', code: 'CS301', name: 'Database Management Systems', department: 'Computer Science', semester: 4, credits: 4, type: 'theory', description: 'Fundamentals of relational database design and SQL', facultyInstructor: 'Dr. Priya Menon' },
  { id: 'cs-302', code: 'CS302', name: 'Operating Systems', department: 'Computer Science', semester: 4, credits: 4, type: 'theory', description: 'Process management, memory, and file systems', facultyInstructor: 'Prof. Rajesh Kumar' },
  { id: 'cs-303', code: 'CS303', name: 'Computer Networks', department: 'Computer Science', semester: 4, credits: 3, type: 'theory', description: 'OSI model, TCP/IP, and network protocols', facultyInstructor: 'Dr. Ankit Sharma' },
  { id: 'cs-304', code: 'CS304', name: 'Software Engineering', department: 'Computer Science', semester: 4, credits: 3, type: 'theory', description: 'SDLC, agile methodologies, and project management', facultyInstructor: 'Ms. Kavita Iyer' },
  { id: 'cs-305', code: 'CS305', name: 'Web Development Lab', department: 'Computer Science', semester: 4, credits: 2, type: 'lab', description: 'Practical web development with React and Node.js', facultyInstructor: 'Dr. Priya Menon' },
];

const MOCK_TIMETABLE: TimetableGrid = {
  section: 'A',
  semester: 4,
  entries: [
    { id: '1', dayOfWeek: 'Monday', period: 1, timeSlot: '09:00-09:55', subjectCode: 'CS301', subjectName: 'Database Management Systems', facultyName: 'Dr. Priya Menon', roomNumber: 'CR-101' },
    { id: '2', dayOfWeek: 'Monday', period: 2, timeSlot: '09:55-10:50', subjectCode: 'CS302', subjectName: 'Operating Systems', facultyName: 'Prof. Rajesh Kumar', roomNumber: 'CR-102' },
    { id: '3', dayOfWeek: 'Monday', period: 3, timeSlot: '11:10-12:05', subjectCode: 'CS303', subjectName: 'Computer Networks', facultyName: 'Dr. Ankit Sharma', roomNumber: 'CR-103' },
    { id: '4', dayOfWeek: 'Tuesday', period: 1, timeSlot: '09:00-09:55', subjectCode: 'CS304', subjectName: 'Software Engineering', facultyName: 'Ms. Kavita Iyer', roomNumber: 'CR-101' },
    { id: '5', dayOfWeek: 'Tuesday', period: 2, timeSlot: '09:55-10:50', subjectCode: 'CS305', subjectName: 'Web Development Lab', facultyName: 'Dr. Priya Menon', roomNumber: 'Lab-201' },
  ],
};

const MOCK_NOTICES: Notice[] = [
  { id: '1', title: 'Mid-Semester Examination Schedule', content: 'The mid-semester examinations will be conducted from March 15-25, 2024. Students must carry their ID cards.', category: 'examination', targetRole: 'student', publishedAt: '2024-02-28T10:00:00Z', publishedBy: 'Dr. Rajesh Kumar', isUrgent: true },
  { id: '2', title: 'Annual Tech Fest - Registrations Open', content: 'Register for Innovate 2024 - the annual technical fest. Last date: March 10, 2024.', category: 'events', targetRole: 'student', publishedAt: '2024-02-25T14:30:00Z', publishedBy: 'Student Council' },
  { id: '3', title: 'Library Holiday Notice', content: 'The library will remain closed on March 1st for annual stock verification.', category: 'general', targetRole: 'student', publishedAt: '2024-02-20T09:00:00Z', publishedBy: 'Library Office' },
];

export function useStudentProfile() {
  return useQuery({
    queryKey: ['student', 'profile'],
    queryFn: async () => {
      try {
        return await getStudentById({ id: 'current' });
      } catch {
        return MOCK_STUDENT;
      }
    },
  });
}

export function useStudentAttendance() {
  return useQuery({
    queryKey: ['student', 'attendance'],
    queryFn: async () => {
      try {
        return await getStudentAttendance({ id: 'current' });
      } catch {
        return MOCK_ATTENDANCE;
      }
    },
  });
}

export function useStudentGrades() {
  return useQuery({
    queryKey: ['student', 'grades'],
    queryFn: async () => {
      try {
        return await getStudentGrades({ id: 'current' });
      } catch {
        return MOCK_GRADES;
      }
    },
  });
}

export function useStudentFees() {
  return useQuery({
    queryKey: ['student', 'fees'],
    queryFn: async () => {
      try {
        return await getStudentFees({ id: 'current' });
      } catch {
        return MOCK_FEES;
      }
    },
  });
}

export function useStudentCourses() {
  return useQuery({
    queryKey: ['student', 'courses'],
    queryFn: async () => {
      try {
        return await getCourses({ department: 'Computer Science', semester: 4 });
      } catch {
        return MOCK_COURSES;
      }
    },
  });
}

export function useStudentTimetable() {
  return useQuery({
    queryKey: ['student', 'timetable'],
    queryFn: async () => {
      try {
        return await getTimetables({ section: 'A', semester: 4 });
      } catch {
        return MOCK_TIMETABLE;
      }
    },
  });
}

export function useNotices() {
  return useQuery({
    queryKey: ['notices'],
    queryFn: async () => {
      try {
        return await getNotices({ targetRole: 'student' });
      } catch {
        return MOCK_NOTICES;
      }
    },
  });
}

const MOCK_BORROWED_BOOKS: CirculationRecord[] = [
  { id: 'cir-001', bookId: 'bk-101', bookTitle: 'Database System Concepts', borrowerId: 'stu-001', borrowerName: 'Aryan Sharma', issueDate: '2024-02-15T10:00:00Z', dueDate: '2024-03-15T10:00:00Z', status: 'issued' },
  { id: 'cir-002', bookId: 'bk-102', bookTitle: 'Operating System Concepts', borrowerId: 'stu-001', borrowerName: 'Aryan Sharma', issueDate: '2024-02-20T14:30:00Z', dueDate: '2024-03-20T14:30:00Z', status: 'issued' },
  { id: 'cir-003', bookId: 'bk-103', bookTitle: 'Computer Networking', borrowerId: 'stu-001', borrowerName: 'Aryan Sharma', issueDate: '2024-01-10T09:00:00Z', dueDate: '2024-02-10T09:00:00Z', returnDate: '2024-02-08T11:00:00Z', status: 'returned' },
];

const MOCK_EXAMINATIONS: Examination[] = [
  { id: 'exam-001', title: 'Mid-Semester Examination', academicYear: '2023-24', semester: 4, startDate: '2024-03-15', endDate: '2024-03-25', status: 'upcoming', hallTicketReleased: false },
  { id: 'exam-002', title: 'End-Semester Examination', academicYear: '2023-24', semester: 4, startDate: '2024-05-01', endDate: '2024-05-15', status: 'upcoming', hallTicketReleased: false },
];

export function useStudentLibrary() {
  return useQuery({
    queryKey: ['student', 'library'],
    queryFn: async () => {
      try {
        return MOCK_BORROWED_BOOKS;
      } catch {
        return MOCK_BORROWED_BOOKS;
      }
    },
  });
}

export function useExaminations() {
  return useQuery({
    queryKey: ['examinations'],
    queryFn: async () => {
      try {
        return MOCK_EXAMINATIONS;
      } catch {
        return MOCK_EXAMINATIONS;
      }
    },
  });
}

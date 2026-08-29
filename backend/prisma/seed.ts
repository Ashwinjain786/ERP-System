import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Seeding initial data...');

  const password = await bcrypt.hash('admin123', 10);

  // 1. Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@campus.edu' },
    update: {},
    create: {
      email: 'admin@campus.edu',
      name: 'System Admin',
      password,
      role: 'admin',
    },
  });

  // 2. Department
  const csDept = await prisma.department.upsert({
    where: { code: 'CSE' },
    update: {},
    create: {
      code: 'CSE',
      name: 'Computer Science and Engineering',
    },
  });

  // 3. Faculty
  const facultyPassword = await bcrypt.hash('faculty123', 10);
  const facultyUser = await prisma.user.upsert({
    where: { email: 'faculty@campus.edu' },
    update: {},
    create: {
      email: 'faculty@campus.edu',
      name: 'Dr. Priya Menon',
      password: facultyPassword,
      role: 'faculty',
      facultyProfile: {
        create: {
          employeeCode: 'FAC1001',
          departmentId: csDept.id,
          designation: 'Professor',
        },
      },
    },
  });

  // 4. Student
  const studentPassword = await bcrypt.hash('student123', 10);
  const studentUser = await prisma.user.upsert({
    where: { email: 'student@campus.edu' },
    update: {},
    create: {
      email: 'student@campus.edu',
      name: 'Aryan Sharma',
      password: studentPassword,
      role: 'student',
      studentProfile: {
        create: {
          rollNumber: '22CS001',
          departmentId: csDept.id,
          semester: 4,
          section: 'A',
          batch: '2022-2026'
        },
      },
    },
  });

  const facultyProfile = await prisma.faculty.findUnique({
    where: { userId: facultyUser.id }
  });

  // 5. Course
  const course = await prisma.course.upsert({
    where: { code: 'CS301' },
    update: {},
    create: {
      code: 'CS301',
      name: 'Database Management Systems',
      departmentId: csDept.id,
      semester: 4,
      credits: 4,
      facultyId: facultyProfile?.id
    }
  });

  // 6. Timetable
  await prisma.timetableEntry.upsert({
    where: { 
      dayOfWeek_period_facultyId: {
        dayOfWeek: 'Monday',
        period: 1,
        facultyId: facultyProfile!.id
      }
    },
    update: {},
    create: {
      dayOfWeek: 'Monday',
      period: 1,
      timeSlot: '09:00-09:55',
      courseId: course.id,
      facultyId: facultyProfile!.id,
      roomNumber: 'CR-101',
      section: 'A',
      semester: 4,
      departmentId: csDept.id
    }
  });

  // 7. Notice
  await prisma.notice.create({
    data: {
      title: 'Mid-Semester Examination Schedule',
      content: 'The mid-semester examinations will be conducted from March 15-25, 2024. Students must carry their ID cards.',
      category: 'examination',
      targetRole: 'student',
      publishedBy: 'System Admin',
      isUrgent: true
    }
  });

  // 8. Book
  const book = await prisma.book.upsert({
    where: { isbn: '978-0078022159' },
    update: {},
    create: {
      isbn: '978-0078022159',
      title: 'Database System Concepts',
      author: 'Silberschatz, Korth, Sudarshan',
      totalCopies: 5,
      availableCopies: 4
    }
  });

  await prisma.circulationRecord.create({
    data: {
      bookId: book.id,
      borrowerId: studentUser.id,
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      status: 'issued'
    }
  });

  // 9. Permissions
  const perm1 = await prisma.permission.upsert({
    where: { name: 'manage_students' },
    update: {},
    create: { name: 'manage_students', category: 'Student', description: 'Manage students' }
  });
  const perm2 = await prisma.permission.upsert({
    where: { name: 'manage_faculty' },
    update: {},
    create: { name: 'manage_faculty', category: 'Faculty', description: 'Manage faculty' }
  });
  const perm3 = await prisma.permission.upsert({
    where: { name: 'manage_admissions' },
    update: {},
    create: { name: 'manage_admissions', category: 'Admissions', description: 'Manage admissions' }
  });
  const perm4 = await prisma.permission.upsert({
    where: { name: 'view_analytics' },
    update: {},
    create: { name: 'view_analytics', category: 'Analytics', description: 'View analytics dashboard' }
  });

  // Role Permissions
  await prisma.rolePermission.upsert({
    where: { role_permissionId: { role: 'admin', permissionId: perm1.id } },
    update: {},
    create: { role: 'admin', permissionId: perm1.id }
  });
  await prisma.rolePermission.upsert({
    where: { role_permissionId: { role: 'admin', permissionId: perm2.id } },
    update: {},
    create: { role: 'admin', permissionId: perm2.id }
  });
  await prisma.rolePermission.upsert({
    where: { role_permissionId: { role: 'admin', permissionId: perm3.id } },
    update: {},
    create: { role: 'admin', permissionId: perm3.id }
  });
  await prisma.rolePermission.upsert({
    where: { role_permissionId: { role: 'admin', permissionId: perm4.id } },
    update: {},
    create: { role: 'admin', permissionId: perm4.id }
  });

  // 10. Admission Applications (seeds Admissions page)
  const admissions = [
    { applicationId: 'APP2024001', applicantName: 'Rahul Verma', program: 'B.Tech', department: 'Computer Science and Engineering', category: 'General', quota: 'Merit', status: 'pending' },
    { applicationId: 'APP2024002', applicantName: 'Sneha Reddy', program: 'B.Tech', department: 'Computer Science and Engineering', jeeRank: 1450, category: 'OBC', quota: 'Merit', status: 'approved' },
    { applicationId: 'APP2024003', applicantName: 'Vikram Singh', program: 'M.Tech', department: 'Computer Science and Engineering', gateRank: 320, category: 'General', quota: 'GATE', status: 'pending' },
    { applicationId: 'APP2024004', applicantName: 'Kavya Nair', program: 'B.Tech', department: 'Computer Science and Engineering', jeeRank: 2100, category: 'SC', quota: 'Reserved', status: 'approved' },
    { applicationId: 'APP2024005', applicantName: 'Ankit Patel', program: 'B.Tech', department: 'Computer Science and Engineering', jeeRank: 890, category: 'General', quota: 'Merit', status: 'rejected' },
  ];
  for (const app of admissions) {
    await prisma.admissionApplication.upsert({
      where: { applicationId: app.applicationId },
      update: {},
      create: app as any
    });
  }

  // 11. Leave Requests for Faculty (seeds FacultyLeaves page)
  if (facultyProfile) {
    await prisma.leaveRequest.create({
      data: {
        facultyId: facultyProfile.id,
        type: 'Sick Leave',
        fromDate: new Date('2024-03-10'),
        toDate: new Date('2024-03-12'),
        days: 3,
        reason: 'Medical treatment',
        status: 'approved'
      }
    });
    await prisma.leaveRequest.create({
      data: {
        facultyId: facultyProfile.id,
        type: 'Casual Leave',
        fromDate: new Date('2024-04-05'),
        toDate: new Date('2024-04-06'),
        days: 2,
        reason: 'Family function',
        status: 'pending'
      }
    });
  }

  // 12. Additional Book and notice for Library
  const book2 = await prisma.book.upsert({
    where: { isbn: '978-0132350884' },
    update: {},
    create: {
      isbn: '978-0132350884',
      title: 'Clean Code',
      author: 'Robert C. Martin',
      totalCopies: 3,
      availableCopies: 3
    }
  });

  // 13. Second Notice - General announcement
  await prisma.notice.create({
    data: {
      title: 'Campus Recruitment Drive - TCS & Infosys',
      content: 'TCS and Infosys will be conducting campus recruitment drives next month. Final year students must register by April 10.',
      category: 'general',
      targetRole: 'student',
      publishedBy: 'Placement Cell',
      isUrgent: false
    }
  });

  // 14. A second Student for richer data
  const student2Password = await bcrypt.hash('student123', 10);
  await prisma.user.upsert({
    where: { email: 'priya@campus.edu' },
    update: {},
    create: {
      email: 'priya@campus.edu',
      name: 'Priya Singh',
      password: student2Password,
      role: 'student',
      studentProfile: {
        create: {
          rollNumber: '22CS002',
          departmentId: csDept.id,
          semester: 4,
          section: 'A',
          batch: '2022-2026'
        },
      },
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

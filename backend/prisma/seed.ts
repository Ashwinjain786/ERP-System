import prisma from '../src/config/db';
import bcrypt from 'bcryptjs';

async function main() {
  if (process.env.NODE_ENV === 'production') {
    console.error('FATAL: Cannot run seed script in production!');
    process.exit(1);
  }
  
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
      role: 'ADMIN',
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
      name: 'Dr. Jane Smith',
      password: facultyPassword,
      role: 'FACULTY',
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
      name: 'John Doe',
      password: studentPassword,
      role: 'STUDENT',
      studentProfile: {
        create: {
          rollNumber: 'STU2024001',
          departmentId: csDept.id,
          semester: 1,
        },
      },
    },
  });

  // Seed 5 New Modules

  // Permissions
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

  // Role Permissions
  await prisma.rolePermission.upsert({
    where: { role_permissionId: { role: 'ADMIN', permissionId: perm1.id } },
    update: {},
    create: { role: 'ADMIN', permissionId: perm1.id }
  });

  // Admissions
  await prisma.admissionApplication.upsert({
    where: { applicationId: 'APP2024001' },
    update: {},
    create: {
      applicantName: 'Aryan Sharma',
      applicationId: 'APP2024001',
      program: 'B.Tech',
      department: 'Computer Science',
      jeeRank: 1250,
      category: 'General',
      quota: 'JEE',
      status: 'approved'
    }
  });

  // Leaves
  if (facultyUser.facultyProfile) {
    await prisma.leaveRequest.create({
      data: {
        facultyId: facultyUser.facultyProfile.id,
        type: 'Casual Leave',
        fromDate: new Date('2024-03-15'),
        toDate: new Date('2024-03-17'),
        days: 3,
        reason: 'Personal work',
        status: 'approved'
      }
    });
  }

  // Document Requests & Placements
  if (studentUser.studentProfile) {
    await prisma.documentRequest.create({
      data: {
        studentId: studentUser.studentProfile.id,
        documentName: 'Bonafide Certificate',
        status: 'completed'
      }
    });

    await prisma.placementRecord.create({
      data: {
        studentId: studentUser.studentProfile.id,
        companyName: 'Google',
        companyType: 'Product',
        ctc: 18.5,
        offerDate: new Date()
      }
    });
  }

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

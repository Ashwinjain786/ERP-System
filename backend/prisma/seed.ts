import prisma from '../src/config/db';
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
      name: 'Dr. Jane Smith',
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
      name: 'John Doe',
      password: studentPassword,
      role: 'student',
      studentProfile: {
        create: {
          rollNumber: 'STU2024001',
          departmentId: csDept.id,
          semester: 1,
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

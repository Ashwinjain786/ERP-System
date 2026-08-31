-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('student', 'faculty', 'hod', 'admin', 'finance_officer', 'librarian', 'management');

-- CreateEnum
CREATE TYPE "FeeStatus" AS ENUM ('paid', 'partial', 'due');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('present', 'absent');

-- CreateEnum
CREATE TYPE "ExamStatus" AS ENUM ('upcoming', 'ongoing', 'completed', 'evaluated');

-- CreateEnum
CREATE TYPE "FeeQuota" AS ENUM ('general', 'merit', 'management', 'nri');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('UPI', 'NetBanking', 'CreditCard', 'DebitCard', 'Challan', 'DemandDraft');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('success', 'pending', 'failed', 'refunded');

-- CreateEnum
CREATE TYPE "CirculationStatus" AS ENUM ('issued', 'returned', 'overdue');

-- CreateEnum
CREATE TYPE "FineStatus" AS ENUM ('unpaid', 'paid', 'waived');

-- CreateEnum
CREATE TYPE "NoticeCategory" AS ENUM ('academic', 'examination', 'events', 'fee', 'general');

-- CreateEnum
CREATE TYPE "NoticeTargetRole" AS ENUM ('all', 'student', 'faculty', 'hod', 'admin', 'finance_officer', 'librarian', 'management');

-- CreateEnum
CREATE TYPE "CourseType" AS ENUM ('theory', 'lab', 'elective', 'project');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('pending', 'processing', 'completed', 'rejected');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('pending', 'approved', 'rejected', 'waitlisted');

-- CreateEnum
CREATE TYPE "LeaveStatus" AS ENUM ('pending', 'approved', 'rejected', 'cancelled');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'student',
    "phone" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "headOfDepartmentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rollNumber" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "degree" TEXT,
    "semester" INTEGER NOT NULL DEFAULT 1,
    "batch" TEXT,
    "section" TEXT,
    "cgpa" DOUBLE PRECISION DEFAULT 0.0,
    "attendancePercentage" DOUBLE PRECISION DEFAULT 0.0,
    "feeStatus" "FeeStatus" NOT NULL DEFAULT 'due',
    "feeQuota" "FeeQuota" NOT NULL DEFAULT 'general',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Faculty" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "employeeCode" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "qualification" TEXT,
    "weeklyWorkloadHours" DOUBLE PRECISION DEFAULT 0,
    "leaveBalance" DOUBLE PRECISION DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Faculty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "semester" INTEGER NOT NULL,
    "credits" INTEGER NOT NULL,
    "type" "CourseType" NOT NULL DEFAULT 'theory',
    "description" TEXT,
    "faculty_instructor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceRecord" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "period" INTEGER NOT NULL,
    "status" "AttendanceStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttendanceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimetableEntry" (
    "id" TEXT NOT NULL,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "period" INTEGER NOT NULL,
    "timeSlot" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "facultyId" TEXT NOT NULL,
    "roomNumber" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "semester" INTEGER NOT NULL,
    "departmentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimetableEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Examination" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "academicYear" TEXT,
    "semester" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "ExamStatus" NOT NULL DEFAULT 'upcoming',
    "hallTicketReleased" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Examination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamResult" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "examinationId" TEXT,
    "internalScore" DOUBLE PRECISION,
    "endSemScore" DOUBLE PRECISION,
    "totalScore" DOUBLE PRECISION NOT NULL,
    "grade" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExamResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeeStructure" (
    "id" TEXT NOT NULL,
    "program" TEXT NOT NULL,
    "quota" "FeeQuota" NOT NULL DEFAULT 'general',
    "tuitionFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "hostelFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "examFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "libraryDeposit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeeStructure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeeTransaction" (
    "id" TEXT NOT NULL,
    "receiptNumber" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentMethod" "PaymentMethod",
    "status" "TransactionStatus" NOT NULL DEFAULT 'pending',
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeeTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Book" (
    "id" TEXT NOT NULL,
    "isbn" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "publisher" TEXT,
    "category" TEXT,
    "rackLocation" TEXT,
    "totalCopies" INTEGER NOT NULL DEFAULT 1,
    "availableCopies" INTEGER NOT NULL DEFAULT 1,
    "coverImageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CirculationRecord" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "borrowerId" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "returnDate" TIMESTAMP(3),
    "fineAmount" DOUBLE PRECISION DEFAULT 0,
    "status" "CirculationStatus" NOT NULL DEFAULT 'issued',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CirculationRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FineRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "circulationId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "reason" TEXT,
    "status" "FineStatus" NOT NULL DEFAULT 'unpaid',
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FineRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notice" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" "NoticeCategory" NOT NULL DEFAULT 'general',
    "targetRole" "NoticeTargetRole" NOT NULL DEFAULT 'all',
    "department" TEXT,
    "publishedBy" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isUrgent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaveRequest" (
    "id" TEXT NOT NULL,
    "facultyId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "fromDate" TIMESTAMP(3) NOT NULL,
    "toDate" TIMESTAMP(3) NOT NULL,
    "days" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "LeaveStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeaveRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentRequest" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "documentName" TEXT NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'pending',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdmissionApplication" (
    "id" TEXT NOT NULL,
    "applicantName" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "program" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "jeeRank" INTEGER,
    "gateRank" INTEGER,
    "category" TEXT NOT NULL,
    "quota" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'pending',
    "appliedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdmissionApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlacementRecord" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "companyType" TEXT NOT NULL,
    "ctc" DOUBLE PRECISION NOT NULL,
    "offerDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlacementRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "id" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Department_code_key" ON "Department"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Department_headOfDepartmentId_key" ON "Department"("headOfDepartmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_userId_key" ON "Student"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_rollNumber_key" ON "Student"("rollNumber");

-- CreateIndex
CREATE INDEX "Student_departmentId_idx" ON "Student"("departmentId");

-- CreateIndex
CREATE INDEX "Student_feeStatus_idx" ON "Student"("feeStatus");

-- CreateIndex
CREATE INDEX "Student_semester_idx" ON "Student"("semester");

-- CreateIndex
CREATE INDEX "Student_batch_idx" ON "Student"("batch");

-- CreateIndex
CREATE INDEX "Student_departmentId_semester_section_idx" ON "Student"("departmentId", "semester", "section");

-- CreateIndex
CREATE UNIQUE INDEX "Faculty_userId_key" ON "Faculty"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Faculty_employeeCode_key" ON "Faculty"("employeeCode");

-- CreateIndex
CREATE INDEX "Faculty_departmentId_idx" ON "Faculty"("departmentId");

-- CreateIndex
CREATE INDEX "Faculty_designation_idx" ON "Faculty"("designation");

-- CreateIndex
CREATE UNIQUE INDEX "Course_code_key" ON "Course"("code");

-- CreateIndex
CREATE INDEX "Course_departmentId_idx" ON "Course"("departmentId");

-- CreateIndex
CREATE INDEX "Course_departmentId_semester_idx" ON "Course"("departmentId", "semester");

-- CreateIndex
CREATE INDEX "Course_semester_idx" ON "Course"("semester");

-- CreateIndex
CREATE INDEX "AttendanceRecord_studentId_idx" ON "AttendanceRecord"("studentId");

-- CreateIndex
CREATE INDEX "AttendanceRecord_courseId_idx" ON "AttendanceRecord"("courseId");

-- CreateIndex
CREATE INDEX "AttendanceRecord_date_idx" ON "AttendanceRecord"("date");

-- CreateIndex
CREATE INDEX "AttendanceRecord_studentId_courseId_idx" ON "AttendanceRecord"("studentId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceRecord_studentId_courseId_date_period_key" ON "AttendanceRecord"("studentId", "courseId", "date", "period");

-- CreateIndex
CREATE INDEX "TimetableEntry_facultyId_idx" ON "TimetableEntry"("facultyId");

-- CreateIndex
CREATE INDEX "TimetableEntry_courseId_idx" ON "TimetableEntry"("courseId");

-- CreateIndex
CREATE INDEX "TimetableEntry_departmentId_section_semester_idx" ON "TimetableEntry"("departmentId", "section", "semester");

-- CreateIndex
CREATE UNIQUE INDEX "TimetableEntry_dayOfWeek_period_facultyId_key" ON "TimetableEntry"("dayOfWeek", "period", "facultyId");

-- CreateIndex
CREATE UNIQUE INDEX "TimetableEntry_dayOfWeek_period_roomNumber_key" ON "TimetableEntry"("dayOfWeek", "period", "roomNumber");

-- CreateIndex
CREATE UNIQUE INDEX "TimetableEntry_dayOfWeek_period_section_semester_department_key" ON "TimetableEntry"("dayOfWeek", "period", "section", "semester", "departmentId");

-- CreateIndex
CREATE INDEX "Examination_semester_idx" ON "Examination"("semester");

-- CreateIndex
CREATE INDEX "Examination_status_idx" ON "Examination"("status");

-- CreateIndex
CREATE INDEX "ExamResult_studentId_idx" ON "ExamResult"("studentId");

-- CreateIndex
CREATE INDEX "ExamResult_courseId_idx" ON "ExamResult"("courseId");

-- CreateIndex
CREATE INDEX "ExamResult_examinationId_idx" ON "ExamResult"("examinationId");

-- CreateIndex
CREATE UNIQUE INDEX "ExamResult_studentId_courseId_examinationId_key" ON "ExamResult"("studentId", "courseId", "examinationId");

-- CreateIndex
CREATE INDEX "FeeStructure_program_idx" ON "FeeStructure"("program");

-- CreateIndex
CREATE UNIQUE INDEX "FeeStructure_program_quota_key" ON "FeeStructure"("program", "quota");

-- CreateIndex
CREATE UNIQUE INDEX "FeeTransaction_receiptNumber_key" ON "FeeTransaction"("receiptNumber");

-- CreateIndex
CREATE INDEX "FeeTransaction_studentId_idx" ON "FeeTransaction"("studentId");

-- CreateIndex
CREATE INDEX "FeeTransaction_status_idx" ON "FeeTransaction"("status");

-- CreateIndex
CREATE INDEX "FeeTransaction_paidAt_idx" ON "FeeTransaction"("paidAt");

-- CreateIndex
CREATE UNIQUE INDEX "Book_isbn_key" ON "Book"("isbn");

-- CreateIndex
CREATE INDEX "Book_category_idx" ON "Book"("category");

-- CreateIndex
CREATE INDEX "Book_author_idx" ON "Book"("author");

-- CreateIndex
CREATE INDEX "CirculationRecord_borrowerId_idx" ON "CirculationRecord"("borrowerId");

-- CreateIndex
CREATE INDEX "CirculationRecord_bookId_idx" ON "CirculationRecord"("bookId");

-- CreateIndex
CREATE INDEX "CirculationRecord_status_idx" ON "CirculationRecord"("status");

-- CreateIndex
CREATE INDEX "CirculationRecord_dueDate_idx" ON "CirculationRecord"("dueDate");

-- CreateIndex
CREATE INDEX "CirculationRecord_borrowerId_status_idx" ON "CirculationRecord"("borrowerId", "status");

-- CreateIndex
CREATE INDEX "FineRecord_userId_idx" ON "FineRecord"("userId");

-- CreateIndex
CREATE INDEX "FineRecord_status_idx" ON "FineRecord"("status");

-- CreateIndex
CREATE INDEX "FineRecord_circulationId_idx" ON "FineRecord"("circulationId");

-- CreateIndex
CREATE INDEX "Notice_targetRole_idx" ON "Notice"("targetRole");

-- CreateIndex
CREATE INDEX "Notice_publishedAt_idx" ON "Notice"("publishedAt");

-- CreateIndex
CREATE INDEX "Notice_isUrgent_idx" ON "Notice"("isUrgent");

-- CreateIndex
CREATE INDEX "Notice_department_idx" ON "Notice"("department");

-- CreateIndex
CREATE INDEX "LeaveRequest_facultyId_idx" ON "LeaveRequest"("facultyId");

-- CreateIndex
CREATE INDEX "LeaveRequest_status_idx" ON "LeaveRequest"("status");

-- CreateIndex
CREATE INDEX "LeaveRequest_fromDate_toDate_idx" ON "LeaveRequest"("fromDate", "toDate");

-- CreateIndex
CREATE INDEX "DocumentRequest_studentId_idx" ON "DocumentRequest"("studentId");

-- CreateIndex
CREATE INDEX "DocumentRequest_status_idx" ON "DocumentRequest"("status");

-- CreateIndex
CREATE UNIQUE INDEX "AdmissionApplication_applicationId_key" ON "AdmissionApplication"("applicationId");

-- CreateIndex
CREATE INDEX "AdmissionApplication_status_idx" ON "AdmissionApplication"("status");

-- CreateIndex
CREATE INDEX "AdmissionApplication_department_idx" ON "AdmissionApplication"("department");

-- CreateIndex
CREATE INDEX "AdmissionApplication_program_idx" ON "AdmissionApplication"("program");

-- CreateIndex
CREATE INDEX "PlacementRecord_studentId_idx" ON "PlacementRecord"("studentId");

-- CreateIndex
CREATE INDEX "PlacementRecord_companyName_idx" ON "PlacementRecord"("companyName");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_name_key" ON "Permission"("name");

-- CreateIndex
CREATE INDEX "Permission_category_idx" ON "Permission"("category");

-- CreateIndex
CREATE INDEX "RolePermission_role_idx" ON "RolePermission"("role");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_role_permissionId_key" ON "RolePermission"("role", "permissionId");

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_headOfDepartmentId_fkey" FOREIGN KEY ("headOfDepartmentId") REFERENCES "Faculty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Faculty" ADD CONSTRAINT "Faculty_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Faculty" ADD CONSTRAINT "Faculty_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_faculty_instructor_fkey" FOREIGN KEY ("faculty_instructor") REFERENCES "Faculty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimetableEntry" ADD CONSTRAINT "TimetableEntry_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimetableEntry" ADD CONSTRAINT "TimetableEntry_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimetableEntry" ADD CONSTRAINT "TimetableEntry_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamResult" ADD CONSTRAINT "ExamResult_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamResult" ADD CONSTRAINT "ExamResult_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamResult" ADD CONSTRAINT "ExamResult_examinationId_fkey" FOREIGN KEY ("examinationId") REFERENCES "Examination"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeTransaction" ADD CONSTRAINT "FeeTransaction_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CirculationRecord" ADD CONSTRAINT "CirculationRecord_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CirculationRecord" ADD CONSTRAINT "CirculationRecord_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FineRecord" ADD CONSTRAINT "FineRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FineRecord" ADD CONSTRAINT "FineRecord_circulationId_fkey" FOREIGN KEY ("circulationId") REFERENCES "CirculationRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notice" ADD CONSTRAINT "Notice_publishedBy_fkey" FOREIGN KEY ("publishedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentRequest" ADD CONSTRAINT "DocumentRequest_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlacementRecord" ADD CONSTRAINT "PlacementRecord_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;


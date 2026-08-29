/**
 * This file was automatically generated.
 * Do not modify it manually.
 */

import {
  LoginUserInput,
  LoginUserOutput,
  LogoutUserInput,
  LogoutUserOutput,
  GetCurrentUserInput,
  GetCurrentUserOutput,
  GetStudentsInput,
  GetStudentsOutput,
  CreateStudentInput,
  CreateStudentOutput,
  GetStudentByIdInput,
  GetStudentByIdOutput,
  UpdateStudentInput,
  UpdateStudentOutput,
  GetStudentAttendanceInput,
  GetStudentAttendanceOutput,
  GetStudentGradesInput,
  GetStudentGradesOutput,
  GetStudentFeesInput,
  GetStudentFeesOutput,
  GetFacultyListInput,
  GetFacultyListOutput,
  CreateFacultyInput,
  CreateFacultyOutput,
  GetFacultyByIdInput,
  GetFacultyByIdOutput,
  UpdateFacultyInput,
  UpdateFacultyOutput,
  GetFacultyWorkloadInput,
  GetFacultyWorkloadOutput,
  MarkAttendanceInput,
  MarkAttendanceOutput,
  GetAttendanceReportInput,
  GetAttendanceReportOutput,
  GetCoursesInput,
  GetCoursesOutput,
  CreateCourseInput,
  CreateCourseOutput,
  GetCourseByIdInput,
  GetCourseByIdOutput,
  UpdateCourseInput,
  UpdateCourseOutput,
  GetDepartmentsInput,
  GetDepartmentsOutput,
  CreateDepartmentInput,
  CreateDepartmentOutput,
  GetTimetablesInput,
  GetTimetablesOutput,
  GenerateTimetableInput,
  GenerateTimetableOutput,
  GetExaminationsInput,
  GetExaminationsOutput,
  CreateExaminationInput,
  CreateExaminationOutput,
  GetExamResultsInput,
  GetExamResultsOutput,
  SubmitExamResultsInput,
  SubmitExamResultsOutput,
  GetFeeStructuresInput,
  GetFeeStructuresOutput,
  CreateFeeStructureInput,
  CreateFeeStructureOutput,
  GetFeeTransactionsInput,
  GetFeeTransactionsOutput,
  RecordFeePaymentInput,
  RecordFeePaymentOutput,
  GetFeeDefaultersInput,
  GetFeeDefaultersOutput,
  GetLibraryBooksInput,
  GetLibraryBooksOutput,
  CreateLibraryBookInput,
  CreateLibraryBookOutput,
  IssueLibraryBookInput,
  IssueLibraryBookOutput,
  ReturnLibraryBookInput,
  ReturnLibraryBookOutput,
  GetLibraryFinesInput,
  GetLibraryFinesOutput,
  GetNoticesInput,
  GetNoticesOutput,
  CreateNoticeInput,
  CreateNoticeOutput,
  GetInstitutionalOverviewInput,
  GetInstitutionalOverviewOutput,
  GetAdmissionsAnalyticsInput,
  GetAdmissionsAnalyticsOutput,
  GetAcademicPerformanceAnalyticsInput,
  GetAcademicPerformanceAnalyticsOutput,
  GetPlacementAnalyticsInput,
  GetPlacementAnalyticsOutput
} from './apiInterface';

export interface CampusOneCollegeERPPlatformAPI {
  loginUser: {
    input: LoginUserInput;
    response: LoginUserOutput;
  };
  logoutUser: {
    input: LogoutUserInput;
    response: LogoutUserOutput;
  };
  getCurrentUser: {
    input: GetCurrentUserInput;
    response: GetCurrentUserOutput;
  };
  getStudents: {
    input: GetStudentsInput;
    response: GetStudentsOutput;
  };
  createStudent: {
    input: CreateStudentInput;
    response: CreateStudentOutput;
  };
  getStudentById: {
    input: GetStudentByIdInput;
    response: GetStudentByIdOutput;
  };
  updateStudent: {
    input: UpdateStudentInput;
    response: UpdateStudentOutput;
  };
  getStudentAttendance: {
    input: GetStudentAttendanceInput;
    response: GetStudentAttendanceOutput;
  };
  getStudentGrades: {
    input: GetStudentGradesInput;
    response: GetStudentGradesOutput;
  };
  getStudentFees: {
    input: GetStudentFeesInput;
    response: GetStudentFeesOutput;
  };
  getFacultyList: {
    input: GetFacultyListInput;
    response: GetFacultyListOutput;
  };
  createFaculty: {
    input: CreateFacultyInput;
    response: CreateFacultyOutput;
  };
  getFacultyById: {
    input: GetFacultyByIdInput;
    response: GetFacultyByIdOutput;
  };
  updateFaculty: {
    input: UpdateFacultyInput;
    response: UpdateFacultyOutput;
  };
  getFacultyWorkload: {
    input: GetFacultyWorkloadInput;
    response: GetFacultyWorkloadOutput;
  };
  markAttendance: {
    input: MarkAttendanceInput;
    response: MarkAttendanceOutput;
  };
  getAttendanceReport: {
    input: GetAttendanceReportInput;
    response: GetAttendanceReportOutput;
  };
  getCourses: {
    input: GetCoursesInput;
    response: GetCoursesOutput;
  };
  createCourse: {
    input: CreateCourseInput;
    response: CreateCourseOutput;
  };
  getCourseById: {
    input: GetCourseByIdInput;
    response: GetCourseByIdOutput;
  };
  updateCourse: {
    input: UpdateCourseInput;
    response: UpdateCourseOutput;
  };
  getDepartments: {
    input: GetDepartmentsInput;
    response: GetDepartmentsOutput;
  };
  createDepartment: {
    input: CreateDepartmentInput;
    response: CreateDepartmentOutput;
  };
  getTimetables: {
    input: GetTimetablesInput;
    response: GetTimetablesOutput;
  };
  generateTimetable: {
    input: GenerateTimetableInput;
    response: GenerateTimetableOutput;
  };
  getExaminations: {
    input: GetExaminationsInput;
    response: GetExaminationsOutput;
  };
  createExamination: {
    input: CreateExaminationInput;
    response: CreateExaminationOutput;
  };
  getExamResults: {
    input: GetExamResultsInput;
    response: GetExamResultsOutput;
  };
  submitExamResults: {
    input: SubmitExamResultsInput;
    response: SubmitExamResultsOutput;
  };
  getFeeStructures: {
    input: GetFeeStructuresInput;
    response: GetFeeStructuresOutput;
  };
  createFeeStructure: {
    input: CreateFeeStructureInput;
    response: CreateFeeStructureOutput;
  };
  getFeeTransactions: {
    input: GetFeeTransactionsInput;
    response: GetFeeTransactionsOutput;
  };
  recordFeePayment: {
    input: RecordFeePaymentInput;
    response: RecordFeePaymentOutput;
  };
  getFeeDefaulters: {
    input: GetFeeDefaultersInput;
    response: GetFeeDefaultersOutput;
  };
  getLibraryBooks: {
    input: GetLibraryBooksInput;
    response: GetLibraryBooksOutput;
  };
  createLibraryBook: {
    input: CreateLibraryBookInput;
    response: CreateLibraryBookOutput;
  };
  issueLibraryBook: {
    input: IssueLibraryBookInput;
    response: IssueLibraryBookOutput;
  };
  returnLibraryBook: {
    input: ReturnLibraryBookInput;
    response: ReturnLibraryBookOutput;
  };
  getLibraryFines: {
    input: GetLibraryFinesInput;
    response: GetLibraryFinesOutput;
  };
  getNotices: {
    input: GetNoticesInput;
    response: GetNoticesOutput;
  };
  createNotice: {
    input: CreateNoticeInput;
    response: CreateNoticeOutput;
  };
  getInstitutionalOverview: {
    input: GetInstitutionalOverviewInput;
    response: GetInstitutionalOverviewOutput;
  };
  getAdmissionsAnalytics: {
    input: GetAdmissionsAnalyticsInput;
    response: GetAdmissionsAnalyticsOutput;
  };
  getAcademicPerformanceAnalytics: {
    input: GetAcademicPerformanceAnalyticsInput;
    response: GetAcademicPerformanceAnalyticsOutput;
  };
  getPlacementAnalytics: {
    input: GetPlacementAnalyticsInput;
    response: GetPlacementAnalyticsOutput;
  };
}

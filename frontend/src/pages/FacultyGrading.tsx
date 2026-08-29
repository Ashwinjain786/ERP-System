import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { BookMarked, Save, Download, Search, Filter, TrendingUp, Award } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFacultyCourses } from '@/features/faculty/hooks';
import { cn } from '@/lib/utils';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

const GRADE_OPTIONS = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'];

const MOCK_STUDENTS = [
  { id: 'stu-001', rollNumber: '22CS001', name: 'Aryan Sharma', assignments: 85, midsem: 78, endsem: 82, attendance: 95 },
  { id: 'stu-002', rollNumber: '22CS002', name: 'Priya Singh', assignments: 92, midsem: 88, endsem: 90, attendance: 98 },
  { id: 'stu-003', rollNumber: '22CS003', name: 'Rahul Verma', assignments: 75, midsem: 70, endsem: 72, attendance: 88 },
  { id: 'stu-004', rollNumber: '22CS004', name: 'Ankit Patel', assignments: 80, midsem: 75, endsem: 78, attendance: 92 },
  { id: 'stu-005', rollNumber: '22CS005', name: 'Sneha Reddy', assignments: 88, midsem: 85, endsem: 87, attendance: 96 },
  { id: 'stu-006', rollNumber: '22CS006', name: 'Vikram Singh', assignments: 70, midsem: 65, endsem: 68, attendance: 82 },
];

export default function FacultyGrading() {
  const reduceMotion = useReducedMotion();
  const Wrapper = reduceMotion ? 'div' : motion.div;
  const { data: courses } = useFacultyCourses();
  
  const [selectedCourse, setSelectedCourse] = useState<string>(courses?.[0]?.id || '');
  const [grades, setGrades] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    MOCK_STUDENTS.forEach(s => { initial[s.id] = ''; });
    return initial;
  });
  const [searchTerm, setSearchTerm] = useState('');

  const handleGradeChange = (studentId: string, grade: string) => {
    setGrades(prev => ({ ...prev, [studentId]: grade }));
  };

  const filteredStudents = MOCK_STUDENTS.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateGrade = (student: typeof MOCK_STUDENTS[0]) => {
    const weighted = (student.assignments * 0.3) + (student.midsem * 0.3) + (student.endsem * 0.4);
    if (weighted >= 90) return 'A+';
    if (weighted >= 85) return 'A';
    if (weighted >= 80) return 'A-';
    if (weighted >= 75) return 'B+';
    if (weighted >= 70) return 'B';
    if (weighted >= 65) return 'B-';
    if (weighted >= 60) return 'C+';
    if (weighted >= 55) return 'C';
    if (weighted >= 50) return 'C-';
    if (weighted >= 40) return 'D';
    return 'F';
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b-2 border-border/60 bg-gradient-to-r from-primary/5 via-background to-background">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
          <Wrapper variants={container} initial="hidden" animate="show" className="space-y-4">
            <Wrapper variants={item}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="font-display text-3xl font-bold tracking-tight">Grade Entry</h1>
                  <p className="mt-1 text-muted-foreground">Submit and manage student grades</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="gap-2">
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                  <Button className="gap-2">
                    <Save className="w-4 h-4" />
                    Save Grades
                  </Button>
                </div>
              </div>
            </Wrapper>
          </Wrapper>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <div className="grid gap-6 lg:grid-cols-4">
          <div className="lg:col-span-1 space-y-4">
            <Card className="border-2 border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-display">Select Course</CardTitle>
                <CardDescription>Choose a course to grade</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {courses?.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => setSelectedCourse(course.id)}
                    className={cn(
                      "w-full text-left p-3 rounded-lg border-2 transition-all duration-200",
                      selectedCourse === course.id
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border/60 hover:border-primary/30 bg-card hover:bg-muted/30"
                    )}
                  >
                    <p className="font-semibold text-foreground text-sm truncate">{course.name}</p>
                    <p className="text-xs text-muted-foreground">{course.code} • Semester {course.semester}</p>
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card className="border-2 border-border/60">
              <CardHeader>
                <CardTitle className="text-lg font-display">Grade Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Students</span>
                  <span className="font-semibold text-foreground">{MOCK_STUDENTS.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Graded</span>
                  <span className="font-semibold text-success">
                    {Object.values(grades).filter(g => g !== '').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pending</span>
                  <span className="font-semibold text-warning">
                    {Object.values(grades).filter(g => g === '').length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Card className="border-2 border-border/60">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg font-display">Student Grades</CardTitle>
                    <CardDescription>Enter grades for {courses?.find(c => c.id === selectedCourse)?.name}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        placeholder="Search students..." 
                        className="pl-9 w-48"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Button variant="outline" size="icon">
                      <Filter className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-border">
                        <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-sm">Student</th>
                        <th className="text-center py-3 px-4 font-semibold text-muted-foreground text-sm">Assignments</th>
                        <th className="text-center py-3 px-4 font-semibold text-muted-foreground text-sm">Midsem</th>
                        <th className="text-center py-3 px-4 font-semibold text-muted-foreground text-sm">Endsem</th>
                        <th className="text-center py-3 px-4 font-semibold text-muted-foreground text-sm">Attendance</th>
                        <th className="text-center py-3 px-4 font-semibold text-muted-foreground text-sm">Total</th>
                        <th className="text-center py-3 px-4 font-semibold text-muted-foreground text-sm">Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((student) => {
                        const total = Math.round((student.assignments * 0.3) + (student.midsem * 0.3) + (student.endsem * 0.4));
                        return (
                          <motion.tr
                            key={student.id}
                            layout
                            className="border-b border-border/40 hover:bg-muted/30 transition-colors"
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-xs font-semibold text-primary">
                                    {student.name.split(' ').map(n => n[0]).join('')}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-semibold text-foreground text-sm">{student.name}</p>
                                  <p className="text-xs text-muted-foreground">{student.rollNumber}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center text-foreground">{student.assignments}</td>
                            <td className="py-3 px-4 text-center text-foreground">{student.midsem}</td>
                            <td className="py-3 px-4 text-center text-foreground">{student.endsem}</td>
                            <td className="py-3 px-4 text-center text-foreground">{student.attendance}%</td>
                            <td className="py-3 px-4 text-center">
                              <span className={cn(
                                "font-semibold",
                                total >= 75 ? "text-success" : total >= 60 ? "text-warning" : "text-destructive"
                              )}>
                                {total}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-center gap-2">
                                <select
                                  value={grades[student.id]}
                                  onChange={(e) => handleGradeChange(student.id, e.target.value)}
                                  className={cn(
                                    "h-9 px-3 rounded-lg border-2 bg-background text-sm font-medium transition-colors",
                                    grades[student.id] ? "border-primary bg-primary/5 text-primary" : "border-border"
                                  )}
                                >
                                  <option value="">Select</option>
                                  {GRADE_OPTIONS.map(grade => (
                                    <option key={grade} value={grade}>{grade}</option>
                                  ))}
                                </select>
                                {grades[student.id] === '' && (
                                  <span className="text-xs text-muted-foreground">
                                    ({calculateGrade(student)})
                                  </span>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

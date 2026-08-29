import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Check, X, Save, BookOpen, Users, Clock } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFacultyWorkload, useFacultyStudents } from '@/features/faculty/hooks';
import { cn } from '@/lib/utils';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

const MOCK_CLASSES = [
  { id: 'c1', courseCode: 'CS301', courseName: 'Database Management Systems', section: 'A', date: '2024-03-04', time: '09:00 - 10:00' },
  { id: 'c2', courseCode: 'CS301', courseName: 'Database Management Systems', section: 'B', date: '2024-03-04', time: '11:00 - 12:00' },
  { id: 'c3', courseCode: 'CS305', courseName: 'Web Development Lab', section: 'A', date: '2024-03-04', time: '14:00 - 16:00' },
];

const MOCK_STUDENTS_ATTENDANCE = [
  { id: 'stu-001', rollNumber: '22CS001', name: 'Aryan Sharma', status: 'present' },
  { id: 'stu-002', rollNumber: '22CS002', name: 'Priya Singh', status: 'present' },
  { id: 'stu-003', rollNumber: '22CS003', name: 'Rahul Verma', status: 'absent' },
  { id: 'stu-004', rollNumber: '22CS004', name: 'Ankit Patel', status: 'present' },
  { id: 'stu-005', rollNumber: '22CS005', name: 'Sneha Reddy', status: 'present' },
  { id: 'stu-006', rollNumber: '22CS006', name: 'Vikram Singh', status: 'present' },
  { id: 'stu-007', rollNumber: '22CS007', name: 'Kavya Nair', status: 'absent' },
  { id: 'stu-008', rollNumber: '22CS008', name: 'Rohan Gupta', status: 'present' },
];

export default function FacultyAttendance() {
  const reduceMotion = useReducedMotion();
  const Wrapper = reduceMotion ? 'div' : motion.div;
  const { data: workload } = useFacultyWorkload();
  
  const [selectedClass, setSelectedClass] = useState<string>(MOCK_CLASSES[0]?.id || '');
  const [attendance, setAttendance] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    MOCK_STUDENTS_ATTENDANCE.forEach(s => { initial[s.id] = s.status; });
    return initial;
  });

  const handleToggle = (studentId: string) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: prev[studentId] === 'present' ? 'absent' : 'present'
    }));
  };

  const handleMarkAll = (status: 'present' | 'absent') => {
    setAttendance(prev => {
      const updated = { ...prev };
      MOCK_STUDENTS_ATTENDANCE.forEach(s => { updated[s.id] = status; });
      return updated;
    });
  };

  const currentClass = MOCK_CLASSES.find(c => c.id === selectedClass);
  const presentCount = Object.values(attendance).filter(s => s === 'present').length;
  const totalCount = MOCK_STUDENTS_ATTENDANCE.length;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b-2 border-border/60 bg-gradient-to-r from-primary/5 via-background to-background">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
          <Wrapper variants={container} initial="hidden" animate="show" className="space-y-4">
            <Wrapper variants={item}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="font-display text-3xl font-bold tracking-tight">Mark Attendance</h1>
                  <p className="mt-1 text-muted-foreground">Record student attendance for your classes</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleMarkAll('present')}>
                    All Present
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleMarkAll('absent')}>
                    All Absent
                  </Button>
                </div>
              </div>
            </Wrapper>
          </Wrapper>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1 space-y-4">
            <Card className="border-2 border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-display">Select Class</CardTitle>
                <CardDescription>Choose a class to mark attendance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {MOCK_CLASSES.map((cls) => (
                  <button
                    key={cls.id}
                    onClick={() => setSelectedClass(cls.id)}
                    className={cn(
                      "w-full text-left p-3 rounded-lg border-2 transition-all duration-200",
                      selectedClass === cls.id
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border/60 hover:border-primary/30 bg-card hover:bg-muted/30"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <BookOpen className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm truncate">{cls.courseName}</p>
                        <p className="text-xs text-muted-foreground">Section {cls.section} • {cls.time}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card className="border-2 border-border/60">
              <CardContent className="p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Attendance Summary</span>
                  <span className="font-semibold text-foreground">{presentCount}/{totalCount}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                  <div 
                    className="h-full bg-success transition-all duration-300"
                    style={{ width: `${(presentCount / totalCount) * 100}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="border-2 border-border/60">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-display">
                      {currentClass?.courseName} - Section {currentClass?.section}
                    </CardTitle>
                    <CardDescription>{currentClass?.date} • {currentClass?.time}</CardDescription>
                  </div>
                  <Button className="gap-2">
                    <Save className="w-4 h-4" />
                    Save Attendance
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {MOCK_STUDENTS_ATTENDANCE.map((student) => (
                    <motion.div
                      key={student.id}
                      layout
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{student.name}</p>
                          <p className="text-sm text-muted-foreground">{student.rollNumber}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggle(student.id)}
                          className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200",
                            attendance[student.id] === 'present'
                              ? "bg-success/10 text-success border-2 border-success/30"
                              : "bg-muted text-muted-foreground border-2 border-transparent hover:border-border"
                          )}
                        >
                          {attendance[student.id] === 'present' ? (
                            <>
                              <Check className="w-4 h-4" />
                              Present
                            </>
                          ) : (
                            <>
                              <X className="w-4 h-4" />
                              Absent
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { BookOpen, Users, Clock, Building2, GraduationCap } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFacultyWorkload } from '@/features/faculty/hooks';
import { cn } from '@/lib/utils';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

export default function FacultyClasses() {
  const reduceMotion = useReducedMotion();
  const Wrapper = reduceMotion ? 'div' : motion.div;
  const { data: workload } = useFacultyWorkload();

  const totalHours = workload?.reduce((acc, w) => acc + w.hoursPerWeek, 0) || 0;
  const totalStudents = workload?.reduce((acc, w) => acc + (w.totalStudents || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b-2 border-border/60 bg-gradient-to-r from-primary/5 via-background to-background">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
          <Wrapper variants={container} initial="hidden" animate="show" className="space-y-4">
            <Wrapper variants={item}>
              <div>
                <h1 className="font-display text-3xl font-bold tracking-tight">My Classes</h1>
                <p className="mt-1 text-muted-foreground">View your assigned batches and course workload</p>
              </div>
            </Wrapper>
          </Wrapper>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-2 border-border/60 bg-card">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Total Courses</span>
                <div className="p-2 rounded-xl bg-primary/10">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div className="mt-3">
                <span className="font-display text-3xl font-bold tracking-tight tabular-nums">{workload?.length || 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-border/60 bg-card">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Weekly Hours</span>
                <div className="p-2 rounded-xl bg-blue-500">
                  <Clock className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="mt-3">
                <span className="font-display text-3xl font-bold tracking-tight tabular-nums">{totalHours}h</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-border/60 bg-card">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Total Students</span>
                <div className="p-2 rounded-xl bg-violet-500">
                  <Users className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="mt-3">
                <span className="font-display text-3xl font-bold tracking-tight tabular-nums">{totalStudents}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-border/60 bg-card">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Sections</span>
                <div className="p-2 rounded-xl bg-amber-500">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="mt-3">
                <span className="font-display text-3xl font-bold tracking-tight tabular-nums">
                  {workload?.filter((_, i, arr) => arr.findIndex(a => a.section === _.section) === i).length || 0}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-2 border-border/60">
          <CardHeader>
            <CardTitle className="font-display">Assigned Courses</CardTitle>
            <CardDescription>Your current teaching assignments for this semester</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {workload?.map((course) => (
                <div 
                  key={course.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors border-2 border-transparent hover:border-primary/20"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <BookOpen className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{course.courseName}</p>
                      <p className="text-sm text-muted-foreground">
                        {course.courseCode} • Section {course.section}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{course.hoursPerWeek}h/week</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">{course.totalStudents} students</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Building2 className="w-4 h-4" />
                        <span className="text-sm">{course.roomNumber}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-2 border-border/60">
            <CardHeader>
              <CardTitle className="font-display">Workload Summary</CardTitle>
              <CardDescription>Hours distribution by course type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workload?.map((course) => (
                  <div key={course.id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">{course.courseCode}</span>
                      <span className="text-muted-foreground">{course.hoursPerWeek}h</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(course.hoursPerWeek / 20) * 100}%` }}
                        className="h-full bg-primary"
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-border/60">
            <CardHeader>
              <CardTitle className="font-display">Student Distribution</CardTitle>
              <CardDescription>Students per section</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workload?.map((course) => (
                  <div key={course.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-violet-500/10">
                        <GraduationCap className="w-4 h-4 text-violet-500" />
                      </div>
                      <span className="font-medium text-foreground">{course.courseCode} - {course.section}</span>
                    </div>
                    <span className="font-semibold text-foreground">{course.totalStudents}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { BookOpen, User, CreditCard, FlaskConical, FileText, BookMarked } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useStudentCourses } from '@/features/student/hooks';
import type { Course } from '@/api/apiInterface';
import { cn } from '@/lib/utils';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
} as const;

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

function CourseCard({ course, index }: { course: Course; index: number }) {
  const typeColors = {
    theory: 'bg-blue-500',
    lab: 'bg-violet-500',
    elective: 'bg-amber-500',
    project: 'bg-emerald-500',
  };
  
  const typeIcons = {
    theory: BookOpen,
    lab: FlaskConical,
    elective: FileText,
    project: BookMarked,
  };

  const TypeIcon = typeIcons[course.type as keyof typeof typeIcons] || BookOpen;
  const colorClass = typeColors[course.type as keyof typeof typeColors] || 'bg-blue-500';

  return (
    <motion.div variants={item}>
      <Card className="border-2 border-border/60 bg-card transition-all duration-200 hover:border-primary/30 hover:shadow-md h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className={cn("p-2.5 rounded-xl", colorClass)}>
              <TypeIcon className="w-5 h-5 text-white" />
            </div>
            <span className={cn(
              "px-2.5 py-1 rounded-full text-xs font-semibold",
              course.type === 'lab' ? 'bg-violet-100 text-violet-700' :
              course.type === 'theory' ? 'bg-blue-100 text-blue-700' :
              course.type === 'elective' ? 'bg-amber-100 text-amber-700' :
              'bg-emerald-100 text-emerald-700'
            )}>
              {course.type ? (course.type.charAt(0).toUpperCase() + course.type.slice(1)) : 'Course'}
            </span>
          </div>
          <CardTitle className="text-lg font-display mt-3">{course.code}</CardTitle>
          <CardDescription className="line-clamp-2">{course.name}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="w-4 h-4" />
            <span className="truncate">{course.facultyInstructor}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              <span className="font-semibold">{course.credits} Credits</span>
            </div>
            <span className="text-sm text-muted-foreground">Sem {course.semester}</span>
          </div>
          {course.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 pt-2 border-t">
              {course.description}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function CourseSkeleton() {
  return (
    <Card className="border-2 border-border/60 bg-card animate-pulse h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-xl bg-muted" />
          <div className="w-16 h-6 rounded-full bg-muted" />
        </div>
        <div className="h-6 w-24 bg-muted rounded mt-3" />
        <div className="h-4 w-full bg-muted rounded mt-2" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="h-4 w-3/4 bg-muted rounded" />
        <div className="h-4 w-1/2 bg-muted rounded" />
      </CardContent>
    </Card>
  );
}

export default function StudentCourses() {
  const reduceMotion = useReducedMotion();
  const Wrapper = reduceMotion ? 'div' : motion.div;
  const { data: courses, isLoading, error } = useStudentCourses();

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b-2 border-border/60 bg-gradient-to-r from-primary/5 via-background to-background">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
          <Wrapper variants={container} initial="hidden" animate="show">
            <Wrapper variants={item}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="font-display text-3xl font-bold tracking-tight">My Courses</h1>
                  <p className="mt-1 text-muted-foreground">
                    View your enrolled courses and details
                  </p>
                </div>
              </div>
            </Wrapper>

            <Wrapper variants={item}>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
                <Card className="border-2 border-border/60 bg-card">
                  <CardContent className="p-5">
                    <span className="text-sm font-medium text-muted-foreground">Total Courses</span>
                    <div className="mt-2">
                      <span className="font-display text-3xl font-bold tracking-tight tabular-nums">
                        {isLoading ? '-' : courses?.length || 0}
                      </span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-2 border-border/60 bg-card">
                  <CardContent className="p-5">
                    <span className="text-sm font-medium text-muted-foreground">Theory</span>
                    <div className="mt-2">
                      <span className="font-display text-3xl font-bold tracking-tight tabular-nums text-blue-600">
                        {isLoading ? '-' : courses?.filter((c: Course) => c.type === 'theory').length || 0}
                      </span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-2 border-border/60 bg-card">
                  <CardContent className="p-5">
                    <span className="text-sm font-medium text-muted-foreground">Lab</span>
                    <div className="mt-2">
                      <span className="font-display text-3xl font-bold tracking-tight tabular-nums text-violet-600">
                        {isLoading ? '-' : courses?.filter((c: Course) => c.type === 'lab').length || 0}
                      </span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-2 border-border/60 bg-card">
                  <CardContent className="p-5">
                    <span className="text-sm font-medium text-muted-foreground">Total Credits</span>
                    <div className="mt-2">
                      <span className="font-display text-3xl font-bold tracking-tight tabular-nums">
                        {isLoading ? '-' : courses?.reduce((acc: number, c: Course) => acc + c.credits, 0) || 0}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </Wrapper>
          </Wrapper>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        {error ? (
          <Card className="border-2 border-destructive/60 bg-destructive/5">
            <CardContent className="p-6">
              <p className="text-destructive font-medium">Failed to load courses. Please try again.</p>
            </CardContent>
          </Card>
        ) : isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <CourseSkeleton key={i} />
            ))}
          </div>
        ) : courses?.length === 0 ? (
          <Card className="border-2 border-border/60">
            <CardContent className="p-12 text-center">
              <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No Courses Enrolled</h3>
              <p className="mt-2 text-muted-foreground">You are not enrolled in any courses for this semester.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses?.map((course: Course, index: number) => (
              <CourseCard key={course.id} course={course} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

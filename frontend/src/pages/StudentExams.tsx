import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { FileText, Calendar, Download, Award, TrendingUp, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useStudentGrades, useExaminations } from '@/features/student/hooks';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
} as const;

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

function FeeSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-20 bg-muted rounded-lg" />
      <div className="h-20 bg-muted rounded-lg" />
    </div>
  );
}

export default function StudentExams() {
  const reduceMotion = useReducedMotion();
  const Wrapper = reduceMotion ? 'div' : motion.div;
  const { data: grades, isLoading: isLoadingGrades } = useStudentGrades();
  const { data: examinations, isLoading: isLoadingExams } = useExaminations();

  const gradesData = grades || [];
  const examsData = examinations || [];

  const cgpa = gradesData[0]?.cgpa || 0;
  const totalCredits = gradesData[0]?.totalCredits || 0;
  const subjects = gradesData[0]?.subjects || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b-2 border-border/60 bg-gradient-to-r from-primary/5 via-background to-background">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
          <Wrapper variants={container} initial="hidden" animate="show" className="space-y-6">
            <Wrapper variants={item}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="font-display text-3xl font-bold tracking-tight">Examinations</h1>
                  <p className="mt-1 text-muted-foreground">View your grades and upcoming examinations</p>
                </div>
              </div>
            </Wrapper>

            <Wrapper variants={item}>
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-2 border-border/60 bg-card">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <Award className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">CGPA</p>
                        <p className="font-display text-2xl font-bold">{cgpa.toFixed(2)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-2 border-border/60 bg-card">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-success/10">
                        <TrendingUp className="w-6 h-6 text-success" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Credits Earned</p>
                        <p className="font-display text-2xl font-bold">{totalCredits}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-2 border-border/60 bg-card">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-info/10">
                        <Calendar className="w-6 h-6 text-info" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Upcoming Exams</p>
                        <p className="font-display text-2xl font-bold">{examsData.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </Wrapper>
          </Wrapper>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-2 border-border/60">
            <CardHeader>
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Grade Report
              </CardTitle>
              <CardDescription>Current semester performance</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingGrades ? (
                <FeeSkeleton />
              ) : subjects.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-semibold">No Grades Available</h3>
                  <p className="mt-2 text-muted-foreground">Your grades will appear here once published.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {subjects.map((subject, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex-1">
                        <p className="font-medium">{subject.subjectName}</p>
                        <p className="text-sm text-muted-foreground">{subject.subjectCode} • {subject.credits} credits</p>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-lg font-bold">{subject.grade}</p>
                        <p className="text-sm text-muted-foreground">{subject.gradePoint} pts</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-2 border-border/60">
            <CardHeader>
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Examination Schedule
              </CardTitle>
              <CardDescription>Upcoming examinations</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingExams ? (
                <FeeSkeleton />
              ) : examsData.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 mx-auto text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-semibold">No Exams Scheduled</h3>
                  <p className="mt-2 text-muted-foreground">Examination schedule will appear here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {examsData.map((exam) => (
                    <div key={exam.id} className="flex items-center justify-between p-4 rounded-lg border-2 border-border/60">
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 rounded-xl bg-warning/10">
                          <FileText className="w-5 h-5 text-warning" />
                        </div>
                        <div>
                          <p className="font-medium">{exam.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(exam.startDate), 'MMM d')} - {format(new Date(exam.endDate), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-warning/10 text-warning">
                        {exam.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 border-2 border-border/60">
          <CardHeader>
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <Download className="w-5 h-5 text-primary" />
              Download Documents
            </CardTitle>
            <CardDescription>Get your official documents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: 'Marksheet', icon: FileText },
                { label: 'Certificate', icon: Award },
                { label: 'Hall Ticket', icon: CheckCircle },
                { label: 'Transcripts', icon: FileText },
              ].map((doc, index) => (
                <Button key={index} variant="outline" className="h-auto py-4 flex-col gap-2">
                  <doc.icon className="w-5 h-5" />
                  <span className="text-sm">{doc.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

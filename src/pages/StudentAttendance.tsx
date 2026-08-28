import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useStudentAttendance } from '@/features/student/hooks';
import { cn } from '@/lib/utils';
import type { AttendanceRecord } from '@/api/apiInterface';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
} as const;

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

function AttendanceRing({ percentage, size = 'lg' }: { percentage: number; size?: 'sm' | 'lg' }) {
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const color = percentage >= 75 ? 'text-success' : percentage >= 65 ? 'text-warning' : 'text-destructive';
  const ringSize = size === 'lg' ? 'w-28 h-28' : 'w-20 h-20';
  const strokeWidth = size === 'lg' ? 8 : 6;

  return (
    <div className={`relative ${ringSize}`}>
      <svg className={`${ringSize} -rotate-90`} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-muted/20" />
        <circle 
          cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={cn("transition-all duration-1000", color)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("font-display font-bold tabular-nums", size === 'lg' ? 'text-2xl' : 'text-sm', color)}>
          {percentage}%
        </span>
      </div>
    </div>
  );
}

function AttendanceRow({ record }: { record: AttendanceRecord }) {
  const percentage = record.percentage;
  const isShortage = percentage < 75;
  const colorClass = percentage >= 75 ? 'bg-success' : percentage >= 65 ? 'bg-warning' : 'bg-destructive';

  return (
    <motion.div variants={item} className="p-4 rounded-xl border-2 border-border/60 bg-card hover:border-primary/20 transition-all">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-semibold text-muted-foreground">{record.subjectCode}</span>
            {isShortage && (
              <AlertTriangle className="w-4 h-4 text-destructive" />
            )}
          </div>
          <p className="font-semibold text-foreground mt-1">{record.subjectName}</p>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span>{record.attendedClasses} / {record.totalClasses} classes</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="w-32 hidden sm:block">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Attendance</span>
              <span className={cn("font-mono font-semibold tabular-nums",
                percentage >= 75 ? 'text-success' : percentage >= 65 ? 'text-warning' : 'text-destructive'
              )}>
                {percentage}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted/20 overflow-hidden">
              <div 
                className={cn("h-full rounded-full transition-all duration-500", colorClass)}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
          </div>
          
          <AttendanceRing percentage={percentage} size="sm" />
        </div>
      </div>
      
      {isShortage && (
        <div className="mt-3 p-2 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-xs text-destructive font-medium flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Attendance shortage! You need {Math.ceil((75 * record.totalClasses - 100 * record.attendedClasses) / 25)} more classes to reach 75%
          </p>
        </div>
      )}
    </motion.div>
  );
}

function AttendanceSkeleton() {
  return (
    <div className="p-4 rounded-xl border-2 border-border/60 bg-card animate-pulse">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="h-4 w-20 bg-muted rounded" />
          <div className="h-5 w-48 bg-muted rounded mt-2" />
          <div className="h-4 w-32 bg-muted rounded mt-2" />
        </div>
        <div className="w-20 h-20 rounded-full bg-muted" />
      </div>
    </div>
  );
}

export default function StudentAttendance() {
  const reduceMotion = useReducedMotion();
  const Wrapper = reduceMotion ? 'div' : motion.div;
  const { data: attendance, isLoading, error } = useStudentAttendance();

  const shortageSubjects = attendance?.records.filter((r) => r.percentage < 75) || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b-2 border-border/60 bg-gradient-to-r from-primary/5 via-background to-background">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
          <Wrapper variants={container} initial="hidden" animate="show">
            <Wrapper variants={item}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="font-display text-3xl font-bold tracking-tight">Attendance</h1>
                  <p className="mt-1 text-muted-foreground">
                    Track your class attendance and stay on top
                  </p>
                </div>
              </div>
            </Wrapper>

            <Wrapper variants={item}>
              <div className="grid gap-4 md:grid-cols-3 mt-6">
                <Card className="border-2 border-border/60 bg-card">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-emerald-500">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Overall</span>
                      <div className="font-display text-2xl font-bold tracking-tight tabular-nums">
                        {isLoading ? '-' : `${attendance?.overallPercentage || 0}%`}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-2 border-border/60 bg-card">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-blue-500">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Attended</span>
                      <div className="font-display text-2xl font-bold tracking-tight tabular-nums">
                        {isLoading ? '-' : attendance?.attendedLectures || 0}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-2 border-border/60 bg-card">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-muted">
                      <Clock className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Total Classes</span>
                      <div className="font-display text-2xl font-bold tracking-tight tabular-nums">
                        {isLoading ? '-' : attendance?.totalLectures || 0}
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
        {error ? (
          <Card className="border-2 border-destructive/60 bg-destructive/5">
            <CardContent className="p-6">
              <p className="text-destructive font-medium">Failed to load attendance. Please try again.</p>
            </CardContent>
          </Card>
        ) : isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <AttendanceSkeleton key={i} />
            ))}
          </div>
        ) : shortageSubjects.length > 0 && (
          <Card className="border-2 border-destructive/60 bg-destructive/5 mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-display flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                Attendance Warning
              </CardTitle>
              <CardDescription>
                You have {shortageSubjects.length} subject{shortageSubjects.length > 1 ? 's' : ''} below 75% attendance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {shortageSubjects.map((s) => (
                  <span key={s.id} className="px-3 py-1.5 rounded-full bg-destructive/10 text-destructive text-sm font-medium">
                    {s.subjectCode}: {s.percentage}%
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          {attendance?.records.map((record) => (
            <AttendanceRow key={record.id} record={record} />
          ))}
        </div>
      </div>
    </div>
  );
}

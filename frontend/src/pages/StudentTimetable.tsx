import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Calendar, Clock, MapPin, User, BookOpen } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useStudentTimetable } from '@/features/student/hooks';
import type { TimetableEntry } from '@/api/apiInterface';
import { cn } from '@/lib/utils';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
} as const;

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

function TimetableCell({ entry, day, period }: { entry: TimetableEntry | null; day: string; period: number }) {
  if (!entry) {
    return (
      <div className="h-20 p-2 rounded-lg bg-muted/20 border border-dashed border-muted-foreground/20" />
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="h-20 p-2 rounded-lg bg-primary/10 border-2 border-primary/30 hover:border-primary/50 transition-all cursor-pointer group"
    >
      <p className="font-semibold text-xs text-foreground truncate group-hover:text-primary">{entry.subjectCode}</p>
      <p className="text-xs text-muted-foreground truncate mt-0.5">{entry.subjectName}</p>
      <div className="flex items-center gap-1 mt-1">
        <MapPin className="w-2.5 h-2.5 text-muted-foreground" />
        <span className="text-[10px] text-muted-foreground">{entry.roomNumber}</span>
      </div>
    </motion.div>
  );
}

function TimetableSkeleton() {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        <div className="grid grid-cols-7 gap-2">
          {DAYS.map((day) => (
            <div key={day} className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="h-4 w-16 bg-muted rounded mx-auto" />
            </div>
          ))}
        </div>
        <div className="mt-2 space-y-2">
          {PERIODS.map((period) => (
            <div key={period} className="grid grid-cols-7 gap-2">
              <div className="flex items-center justify-center">
                <div className="h-20 w-12 bg-muted rounded animate-pulse" />
              </div>
              {DAYS.map((day) => (
                <div key={`${day}-${period}`} className="h-20 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function StudentTimetable() {
  const reduceMotion = useReducedMotion();
  const Wrapper = reduceMotion ? 'div' : motion.div;
  const { data: timetable, isLoading, error } = useStudentTimetable();

  const timetableMap = React.useMemo(() => {
    if (!timetable?.entries) return {};
    const map: Record<string, TimetableEntry> = {};
    timetable.entries.forEach((entry: TimetableEntry) => {
      const key = `${entry.dayOfWeek}-${entry.period}`;
      map[key] = entry;
    });
    return map;
  }, [timetable]);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b-2 border-border/60 bg-gradient-to-r from-primary/5 via-background to-background">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
          <Wrapper variants={container} initial="hidden" animate="show">
            <Wrapper variants={item}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="font-display text-3xl font-bold tracking-tight">Timetable</h1>
                  <p className="mt-1 text-muted-foreground">
                    Weekly class schedule and room assignments
                  </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary font-medium">
                  <Calendar className="w-5 h-5" />
                  <span>Semester {timetable?.semester} - Section {timetable?.section}</span>
                </div>
              </div>
            </Wrapper>
          </Wrapper>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        {error ? (
          <Card className="border-2 border-destructive/60 bg-destructive/5">
            <CardContent className="p-6">
              <p className="text-destructive font-medium">Failed to load timetable. Please try again.</p>
            </CardContent>
          </Card>
        ) : isLoading ? (
          <Card className="border-2 border-border/60">
            <CardHeader>
              <CardTitle className="text-lg font-display">Weekly Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <TimetableSkeleton />
            </CardContent>
          </Card>
        ) : (
          <Card className="border-2 border-border/60">
            <CardHeader>
              <CardTitle className="text-lg font-display">Weekly Schedule</CardTitle>
              <CardDescription>Click on any class to view details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  <div className="grid grid-cols-7 gap-2">
                    {DAYS.map((day) => (
                      <div key={day} className="text-center p-3 bg-muted/30 rounded-lg">
                        <span className="font-semibold text-sm">{day}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 space-y-2">
                    {PERIODS.map((period) => (
                      <div key={period} className="grid grid-cols-7 gap-2">
                        <div className="flex items-center justify-center">
                          <div className="flex flex-col items-center p-2 bg-muted/30 rounded-lg w-14">
                            <span className="text-xs text-muted-foreground">Period</span>
                            <span className="font-mono font-bold">{period}</span>
                          </div>
                        </div>
                        {DAYS.map((day) => (
                          <TimetableCell 
                            key={`${day}-${period}`} 
                            entry={timetableMap[`${day}-${period}`] || null} 
                            day={day}
                            period={period}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

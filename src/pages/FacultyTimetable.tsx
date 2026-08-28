import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Calendar, Clock, BookOpen, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const TIME_SLOTS = [
  '08:00 - 09:00',
  '09:00 - 10:00',
  '10:00 - 11:00',
  '11:00 - 12:00',
  '12:00 - 13:00',
  '14:00 - 15:00',
  '15:00 - 16:00',
  '16:00 - 17:00',
];

const TIMETABLE_DATA = {
  Mon: [
    { time: '09:00 - 10:00', course: 'Database Management Systems', code: 'CS301', section: 'A', room: 'CR-101' },
    { time: '11:00 - 12:00', course: 'Database Management Systems', code: 'CS301', section: 'B', room: 'CR-102' },
  ],
  Tue: [
    { time: '14:00 - 16:00', course: 'Web Development Lab', code: 'CS305', section: 'A', room: 'Lab-201' },
  ],
  Wed: [
    { time: '09:00 - 10:00', course: 'Database Management Systems', code: 'CS301', section: 'A', room: 'CR-101' },
    { time: '11:00 - 12:00', course: 'Database Management Systems', code: 'CS301', section: 'B', room: 'CR-102' },
  ],
  Thu: [
    { time: '14:00 - 16:00', course: 'Web Development Lab', code: 'CS305', section: 'A', room: 'Lab-201' },
  ],
  Fri: [
    { time: '09:00 - 10:00', course: 'Database Management Systems', code: 'CS301', section: 'A', room: 'CR-101' },
    { time: '10:00 - 11:00', course: 'Advanced Database', code: 'CS501', section: 'A', room: 'CR-201' },
  ],
  Sat: [],
};

export default function FacultyTimetable() {
  const reduceMotion = useReducedMotion();
  const Wrapper = reduceMotion ? 'div' : motion.div;

  const getClassesForDay = (day: string) => TIMETABLE_DATA[day as keyof typeof TIMETABLE_DATA] || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b-2 border-border/60 bg-gradient-to-r from-primary/5 via-background to-background">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
          <Wrapper variants={container} initial="hidden" animate="show" className="space-y-4">
            <Wrapper variants={item}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="font-display text-3xl font-bold tracking-tight">My Timetable</h1>
                  <p className="mt-1 text-muted-foreground">Weekly teaching schedule</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm font-medium text-foreground px-3">Week 10 • Mar 4 - Mar 9</span>
                  <Button variant="outline" size="icon">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Wrapper>
          </Wrapper>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <Card className="border-2 border-border/60 overflow-hidden">
          <CardHeader className="pb-0">
            <CardTitle className="font-display">Weekly Schedule</CardTitle>
            <CardDescription>Your teaching timetable for the current week</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                <div className="grid grid-cols-7 border-b-2 border-border">
                  {DAYS.map((day) => (
                    <div
                      key={day}
                      className="p-4 text-center border-r border-border last:border-r-0"
                    >
                      <span className="font-display text-sm font-semibold text-foreground">{day}</span>
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 min-h-[500px]">
                  {DAYS.map((day, dayIndex) => {
                    const classes = getClassesForDay(day);
                    return (
                      <div
                        key={day}
                        className="border-r border-border last:border-r-0 p-2 space-y-2"
                      >
                        {classes.length > 0 ? (
                          classes.map((cls, idx) => (
                            <motion.div
                              key={`${day}-${idx}`}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: dayIndex * 0.05 + idx * 0.1 }}
                              className={cn(
                                "p-3 rounded-lg border-2 transition-all duration-200 hover:shadow-md",
                                dayIndex % 2 === 0 
                                  ? "bg-primary/5 border-primary/20 hover:border-primary/40" 
                                  : "bg-violet-50 border-violet-200 hover:border-violet-300"
                              )}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                                <span className="text-xs font-medium text-muted-foreground">{cls.time}</span>
                              </div>
                              <p className="font-semibold text-foreground text-sm leading-tight mb-1">
                                {cls.course}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {cls.code} • Section {cls.section}
                              </p>
                              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                                <MapPin className="w-3 h-3" />
                                {cls.room}
                              </div>
                            </motion.div>
                          ))
                        ) : (
                          <div className="h-full flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">-</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-6">
          <Card className="border-2 border-border/60">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Classes</p>
                  <p className="font-display text-xl font-bold">
                    {Object.values(TIMETABLE_DATA).flat().length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-border/60">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Hours</p>
                  <p className="font-display text-xl font-bold">
                    {Object.values(TIMETABLE_DATA).flat().reduce((acc, cls) => {
                      const parts = cls.time.split(' - ');
                      const start = parseInt(parts[0]?.split(':')[0] || '0');
                      const end = parseInt(parts[1]?.split(':')[0] || '0');
                      return acc + (end - start);
                    }, 0)}h
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-border/60">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-violet-500">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Teaching Days</p>
                  <p className="font-display text-xl font-bold">
                    {Object.keys(TIMETABLE_DATA).filter(day => TIMETABLE_DATA[day as keyof typeof TIMETABLE_DATA].length > 0).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-border/60">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Courses</p>
                  <p className="font-display text-xl font-bold">
                    {new Set(Object.values(TIMETABLE_DATA).flat().map(c => c.code)).size}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

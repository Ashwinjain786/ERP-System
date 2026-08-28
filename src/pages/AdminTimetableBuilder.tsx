import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  Calendar, Plus, Save, Download, RotateCcw, GripVertical,
  Clock, Users, MapPin, Filter, CheckCircle, AlertCircle
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCourses, useDepartments } from '@/features/admin/hooks';
import { cn } from '@/lib/utils';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
const TIME_SLOTS = [
  { period: 1, time: '09:00 - 09:55' },
  { period: 2, time: '09:55 - 10:50' },
  { period: 3, time: '10:50 - 11:45' },
  { period: 4, time: '11:45 - 12:40' },
  { period: 5, time: '01:30 - 02:25' },
  { period: 6, time: '02:25 - 03:20' },
  { period: 7, time: '03:20 - 04:15' },
];

const MOCK_TIMETABLE = [
  { id: 't1', day: 'Monday', period: 1, subject: 'Database Management Systems', faculty: 'Dr. Priya Menon', room: 'CS-LAB-1' },
  { id: 't2', day: 'Monday', period: 2, subject: 'Operating Systems', faculty: 'Prof. Rajesh Kumar', room: 'CS-301' },
  { id: 't3', day: 'Tuesday', period: 1, subject: 'Computer Networks', faculty: 'Dr. Ankit Sharma', room: 'CS-302' },
  { id: 't4', day: 'Tuesday', period: 2, subject: 'Software Engineering', faculty: 'Ms. Kavita Iyer', room: 'CS-303' },
  { id: 't5', day: 'Wednesday', period: 1, subject: 'Database Management Systems', faculty: 'Dr. Priya Menon', room: 'CS-LAB-1' },
  { id: 't6', day: 'Wednesday', period: 3, subject: 'Operating Systems', faculty: 'Prof. Rajesh Kumar', room: 'CS-301' },
];

export default function AdminTimetableBuilder() {
  const reduceMotion = useReducedMotion();
  const Wrapper = reduceMotion ? 'div' : motion.div;
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedSemester, setSelectedSemester] = useState(4);
  const [selectedSection, setSelectedSection] = useState('A');

  const { data: courses } = useCourses();
  const { data: departments } = useDepartments();

  const getEntry = (day: string, period: number) => {
    return MOCK_TIMETABLE.find(e => e.day === day && e.period === period);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b-2 border-border/60 bg-gradient-to-r from-amber-500/5 via-background to-background">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
          <Wrapper variants={container} initial="hidden" animate="show" className="space-y-5">
            <Wrapper variants={item}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="font-display text-2xl font-bold tracking-tight">Timetable Builder</h1>
                    <p className="text-sm text-muted-foreground">Create and manage class schedules</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <RotateCcw className="w-4 h-4 mr-1" /> Reset
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-1" /> Export
                  </Button>
                  <Button size="sm">
                    <Save className="w-4 h-4 mr-1" /> Save
                  </Button>
                </div>
              </div>
            </Wrapper>

            <Wrapper variants={item}>
              <Card className="border-2 border-border/60 bg-card">
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-48">
                      <Label className="mb-1.5 block">Department</Label>
                      <select
                        className="h-10 w-full rounded-lg border-2 border-input bg-background px-3 text-sm"
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                      >
                        <option value="">Select Department</option>
                        {departments?.map(dept => (
                          <option key={dept.id} value={dept.name}>{dept.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="w-28">
                      <Label className="mb-1.5 block">Semester</Label>
                      <select
                        className="h-10 w-full rounded-lg border-2 border-input bg-background px-3 text-sm"
                        value={selectedSemester}
                        onChange={(e) => setSelectedSemester(Number(e.target.value))}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                          <option key={s} value={s}>Semester {s}</option>
                        ))}
                      </select>
                    </div>
                    <div className="w-24">
                      <Label className="mb-1.5 block">Section</Label>
                      <select
                        className="h-10 w-full rounded-lg border-2 border-input bg-background px-3 text-sm"
                        value={selectedSection}
                        onChange={(e) => setSelectedSection(e.target.value)}
                      >
                        {['A', 'B', 'C'].map(s => (
                          <option key={s} value={s}>Section {s}</option>
                        ))}
                      </select>
                    </div>
                    <Button variant="outline" className="h-10">
                      <Filter className="w-4 h-4 mr-2" /> Apply Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Wrapper>

            <Wrapper variants={item}>
              <div className="grid gap-3 sm:grid-cols-3">
                <Card className="border-2 border-border/60 bg-card">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-success/10">
                      <CheckCircle className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Conflicts</p>
                      <p className="font-display text-xl font-bold">0</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-2 border-border/60 bg-card">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-warning/10">
                      <AlertCircle className="w-5 h-5 text-warning" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Unassigned</p>
                      <p className="font-display text-xl font-bold">8</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-2 border-border/60 bg-card">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-info/10">
                      <Clock className="w-5 h-5 text-info" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Periods</p>
                      <p className="font-display text-xl font-bold">42</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </Wrapper>
          </Wrapper>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <Card className="border-2 border-border/60 overflow-hidden">
          <CardHeader className="pb-4 border-b border-border/40">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-display">Weekly Timetable</CardTitle>
                <CardDescription>Section {selectedSection} - Semester {selectedSemester}</CardDescription>
              </div>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" /> Add Period
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Wrapper variants={container} initial="hidden" animate="show">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="bg-muted/30">
                      <th className="p-3 text-left text-sm font-semibold text-muted-foreground w-24">Time</th>
                      {DAYS.map(day => (
                        <th key={day} className="p-3 text-center text-sm font-semibold text-muted-foreground">
                          {day.slice(0, 3)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {TIME_SLOTS.map((slot) => (
                      <motion.tr key={slot.period} variants={item} className="border-t border-border/40">
                        <td className="p-3 text-sm">
                          <div className="font-mono text-xs text-muted-foreground">{slot.time}</div>
                          <div className="font-medium text-xs">P{slot.period}</div>
                        </td>
                        {DAYS.map(day => {
                          const entry = getEntry(day, slot.period);
                          return (
                            <td key={`${day}-${slot.period}`} className="p-2 align-top">
                              {entry ? (
                                <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 hover:border-amber-300 transition-colors cursor-pointer group">
                                  <p className="font-medium text-xs text-foreground line-clamp-2">{entry.subject}</p>
                                  <p className="text-xs text-muted-foreground mt-1">{entry.faculty}</p>
                                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                    <MapPin className="w-3 h-3" /> {entry.room}
                                  </p>
                                </div>
                              ) : (
                                <button className="w-full h-16 rounded-lg border-2 border-dashed border-border/60 hover:border-primary/30 hover:bg-primary/5 transition-all flex items-center justify-center">
                                  <Plus className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                              )}
                            </td>
                          );
                        })}
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Wrapper>
          </CardContent>
        </Card>

        <Card className="border-2 border-border/60 mt-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display">Quick Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-amber-500" />
                <span className="text-sm text-muted-foreground">Theory</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-emerald-500" />
                <span className="text-sm text-muted-foreground">Lab</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-purple-500" />
                <span className="text-sm text-muted-foreground">Elective</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

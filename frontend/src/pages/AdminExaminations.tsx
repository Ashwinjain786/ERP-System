import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  FileText, Plus, Search, Calendar, Clock, CheckCircle,
  Download, Users, Award
} from 'lucide-react';
import { format } from 'date-fns';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useExaminations } from '@/features/admin/hooks';
import { cn } from '@/lib/utils';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};


function getStatusColor(status: string) {
  switch (status) {
    case 'completed': return { bg: 'bg-success/10', text: 'text-success', border: 'border-success/20', icon: CheckCircle };
    case 'ongoing': return { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/20', icon: Clock };
    case 'upcoming': return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', icon: Calendar };
    case 'evaluated': return { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', icon: Award };
    default: return { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-border', icon: Clock };
  }
}

type ExamDuty = {
  id: string;
  examinerName: string;
  subject: string;
  date: string;
  session: 'Forenoon' | 'Afternoon' | string;
  room: string;
  students: number;
};

export default function AdminExaminations() {
  const reduceMotion = useReducedMotion();
  const Wrapper = reduceMotion ? 'div' : motion.div;
  const [activeTab, setActiveTab] = useState<'schedule' | 'invigilation' | 'results'>('schedule');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: examinations, isLoading, error } = useExaminations();

  const stats = {
    totalExams: examinations?.length || 0,
    upcoming: examinations?.filter(e => e.status === 'upcoming').length || 0,
    completed: examinations?.filter(e => e.status === 'completed').length || 0,
    pendingResults: 3,
  };

  const tabs = [
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'invigilation', label: 'Invigilation', icon: Users },
    { id: 'results', label: 'Results', icon: Award },
  ] as const;

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Card className="max-w-md mx-auto mt-20 border-destructive">
          <CardContent className="pt-6 text-center">
            <p className="text-destructive font-medium">Failed to load examinations data</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b-2 border-border/60 bg-gradient-to-r from-amber-500/5 via-background to-background">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
          <Wrapper variants={container} initial="hidden" animate="show" className="space-y-5">
            <Wrapper variants={item}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="font-display text-2xl font-bold tracking-tight">Examination Controller</h1>
                    <p className="text-sm text-muted-foreground">Manage exams and assessments</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" /> Export
                  </Button>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" /> New Exam
                  </Button>
                </div>
              </div>
            </Wrapper>

            <Wrapper variants={item}>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="border-2 border-border/60 bg-card">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Total Exams</p>
                    <p className="font-display text-2xl font-bold tabular-nums">{isLoading ? '...' : stats.totalExams}</p>
                  </CardContent>
                </Card>
                <Card className="border-2 border-border/60 bg-card">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Upcoming</p>
                    <p className="font-display text-2xl font-bold tabular-nums text-blue-600">{isLoading ? '...' : stats.upcoming}</p>
                  </CardContent>
                </Card>
                <Card className="border-2 border-border/60 bg-card">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="font-display text-2xl font-bold tabular-nums text-success">{isLoading ? '...' : stats.completed}</p>
                  </CardContent>
                </Card>
                <Card className="border-2 border-border/60 bg-card">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Pending Results</p>
                    <p className="font-display text-2xl font-bold tabular-nums text-warning">{stats.pendingResults}</p>
                  </CardContent>
                </Card>
              </div>
            </Wrapper>
          </Wrapper>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <div className="flex gap-1 mb-6 p-1 bg-muted/50 rounded-xl w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                activeTab === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'schedule' && (
          <Card className="border-2 border-border/60">
            <CardHeader className="pb-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="text-lg font-display">Examination Schedule</CardTitle>
                  <CardDescription>All scheduled examinations</CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search exams..."
                    className="pl-9 w-full sm:w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : (
                <Wrapper variants={container} initial="hidden" animate="show">
                  <div className="space-y-4">
                    {examinations?.map((exam) => {
                      const statusStyle = getStatusColor(exam.status);
                      const StatusIcon = statusStyle.icon;
                      return (
                        <motion.div
                          key={exam.id}
                          variants={item}
                          className={cn(
                            "p-4 rounded-xl border-2 bg-card transition-all hover:shadow-md",
                            statusStyle.border
                          )}
                        >
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <div className={cn("p-2.5 rounded-xl", statusStyle.bg)}>
                                <StatusIcon className={cn("w-5 h-5", statusStyle.text)} />
                              </div>
                              <div>
                                <h3 className="font-display font-semibold text-lg">{exam.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {exam.academicYear} • Semester {exam.semester}
                                </p>
                                <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {format(new Date(exam.startDate), 'MMM d')} - {format(new Date(exam.endDate), 'MMM d, yyyy')}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium",
                                statusStyle.bg, statusStyle.text
                              )}>
                                <StatusIcon className="w-4 h-4" />
                                {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                              </span>
                              {exam.hallTicketReleased && (
                                <Button variant="outline" size="sm">Hall Tickets</Button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </Wrapper>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'invigilation' && (
          <Card className="border-2 border-border/60">
            <CardHeader className="pb-4">
              <div>
                <CardTitle className="text-lg font-display">Invigilation Duties</CardTitle>
                <CardDescription>Assigned invigilators for upcoming exams</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Wrapper variants={container} initial="hidden" animate="show">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-border/60">
                        <th className="text-left pb-3 px-2 text-sm font-semibold text-muted-foreground">Examiner</th>
                        <th className="text-left pb-3 px-2 text-sm font-semibold text-muted-foreground">Subject</th>
                        <th className="text-center pb-3 px-2 text-sm font-semibold text-muted-foreground">Date</th>
                        <th className="text-center pb-3 px-2 text-sm font-semibold text-muted-foreground">Session</th>
                        <th className="text-center pb-3 px-2 text-sm font-semibold text-muted-foreground">Room</th>
                        <th className="text-center pb-3 px-2 text-sm font-semibold text-muted-foreground">Students</th>
                        <th className="text-right pb-3 px-2 text-sm font-semibold text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {([] as ExamDuty[]).map((duty) => (
                        <motion.tr
                          key={duty.id}
                          variants={item}
                          className="border-b border-border/40 hover:bg-muted/30 transition-colors"
                        >
                          <td className="py-3 px-2">
                            <span className="font-medium">{duty.examinerName}</span>
                          </td>
                          <td className="py-3 px-2 text-sm">{duty.subject}</td>
                          <td className="py-3 px-2 text-center">
                            <span className="text-sm">{format(new Date(duty.date), 'MMM d, yyyy')}</span>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span className={cn(
                              "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium",
                              duty.session === 'Forenoon' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                            )}>
                              {duty.session}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-center font-mono text-sm">{duty.room}</td>
                          <td className="py-3 px-2 text-center">
                            <span className="font-mono font-semibold">{duty.students}</span>
                          </td>
                          <td className="py-3 px-2 text-right">
                            <Button variant="ghost" size="sm">Edit</Button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Wrapper>
            </CardContent>
          </Card>
        )}

        {activeTab === 'results' && (
          <Card className="border-2 border-border/60">
            <CardHeader className="pb-4">
              <div>
                <CardTitle className="text-lg font-display">Results Management</CardTitle>
                <CardDescription>Examination results and grade submission</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Wrapper variants={container} initial="hidden" animate="show">
                <div className="grid gap-4 md:grid-cols-2">
                  <motion.div variants={item} className="p-4 rounded-xl border-2 border-border/60 bg-card">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-display font-semibold">Mid-Semester I</h3>
                      <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-success/10 text-success">Evaluated</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">Results published for all departments</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">View Stats</Button>
                      <Button size="sm" className="flex-1">Download</Button>
                    </div>
                  </motion.div>
                  <motion.div variants={item} className="p-4 rounded-xl border-2 border-border/60 bg-card">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-display font-semibold">End-Semester</h3>
                      <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-warning/10 text-warning">Pending</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">Evaluation in progress</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">Reminder</Button>
                      <Button size="sm" className="flex-1">Upload</Button>
                    </div>
                  </motion.div>
                </div>
              </Wrapper>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

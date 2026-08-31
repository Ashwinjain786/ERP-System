import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Users, BookOpen, Plus, Search, Mail, Phone, MoreVertical } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFacultyProfile } from '@/features/faculty/hooks';
import { useFacultyList, useCourses } from '@/features/admin/hooks';
import { cn } from '@/lib/utils';
import type { Course, Faculty } from '@/api/apiInterface';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};


const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'faculty', label: 'Faculty' },
  { id: 'courses', label: 'Courses' },
];

export default function FacultyDepartment() {
  const reduceMotion = useReducedMotion();
  const Wrapper = reduceMotion ? 'div' : motion.div;
  const { data: profile } = useFacultyProfile();
  const { data: allFaculty = [] } = useFacultyList();
  const { data: allCourses = [] } = useCourses();
  
  // Filter by department name if profile is loaded
  const facultyList = (profile?.department ? allFaculty.filter(f => f.department === profile.department) : allFaculty) as Faculty[];
  const courses = (profile?.department ? allCourses.filter(c => c.department === profile.department) : allCourses) as Course[];
  
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFaculty = facultyList.filter((f) =>
    f.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.designation?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b-2 border-border/60 bg-gradient-to-r from-primary/5 via-background to-background">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
          <Wrapper variants={container} initial="hidden" animate="show" className="space-y-4">
            <Wrapper variants={item}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="font-display text-3xl font-bold tracking-tight">Department Management</h1>
                  <p className="mt-1 text-muted-foreground">{profile?.department} • Head of Department</p>
                </div>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Faculty
                </Button>
              </div>
            </Wrapper>
          </Wrapper>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <div className="flex gap-1 mb-6 p-1 bg-muted/50 rounded-lg w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
                activeTab === tab.id
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="border-2 border-border/60">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Total Faculty</span>
                    <div className="p-2 rounded-xl bg-primary/10">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="font-display text-2xl font-bold tabular-nums">{facultyList.length}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-border/60">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Total Courses</span>
                    <div className="p-2 rounded-xl bg-blue-500">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="font-display text-2xl font-bold tabular-nums">{courses.length}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-border/60">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Total Students</span>
                    <div className="p-2 rounded-xl bg-violet-500">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="font-display text-3xl font-bold tracking-tight tabular-nums">
                      {courses.length}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-border/60">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Avg Workload</span>
                    <div className="p-2 rounded-xl bg-amber-500">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="font-display text-3xl font-bold tracking-tight tabular-nums">
                      {facultyList.length > 0 ? Math.round(facultyList.reduce((acc, f) => acc + (f.weeklyWorkloadHours ?? 0), 0) / facultyList.length) : 0}h
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-2 border-border/60">
                <CardHeader>
                  <CardTitle className="font-display">Faculty Overview</CardTitle>
                  <CardDescription>Department faculty members</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {facultyList.map((faculty) => (
                      <div key={faculty.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-semibold text-primary">
                              {faculty.name?.split(' ').map((n: string) => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{faculty.name}</p>
                            <p className="text-xs text-muted-foreground">{faculty.designation}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-foreground">{faculty.weeklyWorkloadHours ?? 0}h</p>
                           <p className="text-xs text-muted-foreground">{faculty.department}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-border/60">
                <CardHeader>
                  <CardTitle className="font-display">Course Distribution</CardTitle>
                  <CardDescription>Courses offered by semester</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[4, 6].map(semester => {
                      const semCourses = courses.filter(c => c.semester === semester);
                      return (
                        <div key={semester} className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">Semester {semester}</p>
                          {semCourses.map((course) => (
                            <div key={course.code} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-violet-500/10">
                                  <BookOpen className="w-4 h-4 text-violet-500" />
                                </div>
                                <div>
                                  <p className="font-semibold text-foreground text-sm">{course.name}</p>
                                  <p className="text-xs text-muted-foreground">{course.code}</p>
                                </div>
                              </div>
                              <span className="text-sm text-muted-foreground">{course.students} students</span>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'faculty' && (
          <Card className="border-2 border-border/60">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="font-display">Faculty Members</CardTitle>
                  <CardDescription>Manage department faculty</CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search faculty..." 
                    className="pl-9 w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredFaculty.map((faculty) => (
                  <div
                    key={faculty.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors border-2 border-transparent hover:border-primary/20"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">
                          {faculty.name?.split(' ').map((n: string) => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{faculty.name}</p>
                        <p className="text-sm text-muted-foreground">{faculty.designation} • {faculty.qualification}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {faculty.email}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {faculty.phone}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="font-display text-lg font-bold text-foreground">{faculty.courses}</p>
                        <p className="text-xs text-muted-foreground">Courses</p>
                      </div>
                      <div className="text-center">
                        <p className="font-display text-lg font-bold text-foreground">{faculty.workload}h</p>
                        <p className="text-xs text-muted-foreground">Workload</p>
                      </div>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'courses' && (
          <Card className="border-2 border-border/60">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-display">Course Management</CardTitle>
                  <CardDescription>Manage department courses</CardDescription>
                </div>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Course
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[4, 6].map(semester => {
                  const semCourses = courses.filter((c) => c.semester === semester);
                  return (
                    <div key={semester} className="space-y-3">
                      <h3 className="font-semibold text-foreground">Semester {semester}</h3>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {semCourses.map((course) => (
                          <div
                            key={course.code}
                            className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors border-2 border-transparent hover:border-primary/20"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-3 rounded-xl bg-primary/10">
                                <BookOpen className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-semibold text-foreground">{course.name}</p>
                                <p className="text-sm text-muted-foreground">{course.code}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-foreground">{course.students} students</p>
                              <p className="text-xs text-muted-foreground">{course.faculty}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

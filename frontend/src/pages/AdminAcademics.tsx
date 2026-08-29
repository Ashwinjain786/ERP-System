import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  BookOpen, Plus, Search, GraduationCap, Award, FileText,
  Clock, Users, MoreVertical, Edit, Trash2
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCourses, useDepartments } from '@/features/admin/hooks';
import { cn } from '@/lib/utils';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const MOCK_PROGRAMS = [
  { id: 'prog-001', name: 'B.Tech', duration: '4 Years', seats: 600, departments: ['Computer Science', 'Information Technology', 'Mechanical Engineering', 'Electrical Engineering', 'Civil Engineering'] },
  { id: 'prog-002', name: 'M.Tech', duration: '2 Years', seats: 120, departments: ['Computer Science', 'Information Technology', 'Mechanical Engineering'] },
  { id: 'prog-003', name: 'M.B.A', duration: '2 Years', seats: 60, departments: ['Management'] },
];

const MOCK_DEGREES = [
  { id: 'deg-001', name: 'Bachelor of Technology', abbreviation: 'B.Tech', level: 'Undergraduate' },
  { id: 'deg-002', name: 'Master of Technology', abbreviation: 'M.Tech', level: 'Postgraduate' },
  { id: 'deg-003', name: 'Master of Business Administration', abbreviation: 'M.B.A', level: 'Postgraduate' },
];

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-14 bg-muted rounded-lg animate-pulse" />
      ))}
    </div>
  );
}

function getCourseTypeColor(type?: string) {
  switch (type) {
    case 'theory': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'lab': return 'bg-green-100 text-green-700 border-green-200';
    case 'elective': return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'project': return 'bg-orange-100 text-orange-700 border-orange-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

export default function AdminAcademics() {
  const reduceMotion = useReducedMotion();
  const Wrapper = reduceMotion ? 'div' : motion.div;
  const [activeTab, setActiveTab] = useState<'programs' | 'degrees' | 'courses'>('programs');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: courses, isLoading: coursesLoading } = useCourses();
  const { data: departments } = useDepartments();

  const filteredCourses = courses?.filter(c => {
    return c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase());
  }) || [];

  const tabs = [
    { id: 'programs', label: 'Programs', icon: GraduationCap },
    { id: 'degrees', label: 'Degrees', icon: Award },
    { id: 'courses', label: 'Courses', icon: BookOpen },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b-2 border-border/60 bg-gradient-to-r from-violet-500/5 via-background to-background">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
          <Wrapper variants={container} initial="hidden" animate="show" className="space-y-5">
            <Wrapper variants={item}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-violet-500">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="font-display text-2xl font-bold tracking-tight">Academics Management</h1>
                    <p className="text-sm text-muted-foreground">Programs, degrees, and courses</p>
                  </div>
                </div>
                <Button>
                  <Plus className="w-4 h-4 mr-2" /> Add New
                </Button>
              </div>
            </Wrapper>

            <Wrapper variants={item}>
              <div className="grid gap-3 sm:grid-cols-3">
                <Card className="border-2 border-border/60 bg-card">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Total Programs</p>
                    <p className="font-display text-2xl font-bold tabular-nums">{MOCK_PROGRAMS.length}</p>
                  </CardContent>
                </Card>
                <Card className="border-2 border-border/60 bg-card">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Degrees Offered</p>
                    <p className="font-display text-2xl font-bold tabular-nums">{MOCK_DEGREES.length}</p>
                  </CardContent>
                </Card>
                <Card className="border-2 border-border/60 bg-card">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Active Courses</p>
                    <p className="font-display text-2xl font-bold tabular-nums">{courses?.length || 0}</p>
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

        {activeTab === 'programs' && (
          <Card className="border-2 border-border/60">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-display">Academic Programs</CardTitle>
                  <CardDescription>All offered degree programs</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Wrapper variants={container} initial="hidden" animate="show">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {MOCK_PROGRAMS.map((program) => (
                    <motion.div
                      key={program.id}
                      variants={item}
                      className="p-4 rounded-xl border-2 border-border/60 bg-card hover:border-primary/30 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-display font-semibold text-lg">{program.name}</h3>
                          <p className="text-sm text-muted-foreground">{program.duration}</p>
                        </div>
                        <div className="p-2 rounded-lg bg-violet-100">
                          <GraduationCap className="w-5 h-5 text-violet-600" />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Users className="w-4 h-4" />
                          <span>{program.seats} seats</span>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {program.departments.slice(0, 3).map((dept, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-secondary text-xs">{dept}</span>
                        ))}
                        {program.departments.length > 3 && (
                          <span className="px-2 py-0.5 rounded bg-secondary text-xs">+{program.departments.length - 3}</span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Wrapper>
            </CardContent>
          </Card>
        )}

        {activeTab === 'degrees' && (
          <Card className="border-2 border-border/60">
            <CardHeader className="pb-4">
              <div>
                <CardTitle className="text-lg font-display">Degree Catalog</CardTitle>
                <CardDescription>All recognized degrees</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Wrapper variants={container} initial="hidden" animate="show">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-border/60">
                        <th className="text-left pb-3 px-2 text-sm font-semibold text-muted-foreground">Abbreviation</th>
                        <th className="text-left pb-3 px-2 text-sm font-semibold text-muted-foreground">Degree Name</th>
                        <th className="text-left pb-3 px-2 text-sm font-semibold text-muted-foreground">Level</th>
                        <th className="text-right pb-3 px-2 text-sm font-semibold text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_DEGREES.map((degree) => (
                        <motion.tr
                          key={degree.id}
                          variants={item}
                          className="border-b border-border/40 hover:bg-muted/30 transition-colors"
                        >
                          <td className="py-3 px-2">
                            <span className="font-display font-semibold text-primary">{degree.abbreviation}</span>
                          </td>
                          <td className="py-3 px-2">{degree.name}</td>
                          <td className="py-3 px-2">
                            <span className={cn(
                              "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium",
                              degree.level === 'Undergraduate' ? 'bg-blue-100 text-blue-700' : 'bg-violet-100 text-violet-700'
                            )}>
                              {degree.level}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-right">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Edit className="w-4 h-4" />
                            </Button>
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

        {activeTab === 'courses' && (
          <Card className="border-2 border-border/60">
            <CardHeader className="pb-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="text-lg font-display">Course Catalog</CardTitle>
                  <CardDescription>{filteredCourses.length} courses</CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search courses..."
                    className="pl-9 w-full sm:w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {coursesLoading ? (
                <TableSkeleton />
              ) : (
                <Wrapper variants={container} initial="hidden" animate="show">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-border/60">
                          <th className="text-left pb-3 px-2 text-sm font-semibold text-muted-foreground">Code</th>
                          <th className="text-left pb-3 px-2 text-sm font-semibold text-muted-foreground">Course Name</th>
                          <th className="text-left pb-3 px-2 text-sm font-semibold text-muted-foreground">Department</th>
                          <th className="text-center pb-3 px-2 text-sm font-semibold text-muted-foreground">Sem</th>
                          <th className="text-center pb-3 px-2 text-sm font-semibold text-muted-foreground">Credits</th>
                          <th className="text-center pb-3 px-2 text-sm font-semibold text-muted-foreground">Type</th>
                          <th className="text-right pb-3 px-2 text-sm font-semibold text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCourses.map((course) => (
                          <motion.tr
                            key={course.id}
                            variants={item}
                            className="border-b border-border/40 hover:bg-muted/30 transition-colors"
                          >
                            <td className="py-3 px-2">
                              <span className="font-mono text-sm font-medium">{course.code}</span>
                            </td>
                            <td className="py-3 px-2">
                              <div>
                                <p className="font-medium">{course.name}</p>
                                <p className="text-xs text-muted-foreground">{course.facultyInstructor}</p>
                              </div>
                            </td>
                            <td className="py-3 px-2 text-sm">{course.department}</td>
                            <td className="py-3 px-2 text-center">
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-secondary text-sm font-medium">
                                {course.semester}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-center">
                              <span className="font-mono font-semibold">{course.credits}</span>
                            </td>
                            <td className="py-3 px-2 text-center">
                              <span className={cn(
                                "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border",
                                getCourseTypeColor(course.type || '')
                              )}>
                                {(course.type || '').charAt(0).toUpperCase() + (course.type || '').slice(1)}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-right">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Wrapper>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

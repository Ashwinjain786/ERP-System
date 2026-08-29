import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  BookOpen, Plus, Search, GraduationCap, Award, FileText,
  Clock, Users, MoreVertical, Edit, Trash2
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCourses, useDepartments, useDepartmentMutations } from '@/features/admin/hooks';
import { cn } from '@/lib/utils';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};


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
  const [activeTab, setActiveTab] = useState<'courses'>('courses');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDepartmentForm, setShowDepartmentForm] = useState(false);
  const [departmentForm, setDepartmentForm] = useState({ code: '', name: '' });

  const { data: courses, isLoading: coursesLoading } = useCourses();
  const { data: departments } = useDepartments();
  const departmentMutations = useDepartmentMutations();

  const filteredCourses = courses?.filter(c => {
    return c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase());
  }) || [];
  
  const tabs = [
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
                <Button onClick={() => setShowDepartmentForm((value) => !value)}>
                  <Plus className="w-4 h-4 mr-2" /> Add New
                </Button>
              </div>
            </Wrapper>

          </Wrapper>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <Card className="mb-6 border-2 border-border/60">
          <CardHeader><CardTitle className="text-lg font-display">Departments</CardTitle><CardDescription>{departments?.length ?? 0} departments</CardDescription></CardHeader>
          <CardContent>
            {showDepartmentForm && <form className="mb-5 flex flex-col md:flex-row gap-3" onSubmit={async (event) => { event.preventDefault(); await departmentMutations.create.mutateAsync(departmentForm); setDepartmentForm({ code: '', name: '' }); setShowDepartmentForm(false); }}>
              <Input required placeholder="Code" value={departmentForm.code} onChange={(e) => setDepartmentForm({ ...departmentForm, code: e.target.value })} />
              <Input required placeholder="Department name" value={departmentForm.name} onChange={(e) => setDepartmentForm({ ...departmentForm, name: e.target.value })} />
              <Button type="submit" disabled={departmentMutations.create.isPending}>Create</Button>
            </form>}
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {departments?.map((department) => <div key={department.id} className="rounded-lg border p-4"><div className="flex justify-between"><span className="font-mono font-semibold">{department.code}</span><div className="flex gap-1"><Button variant="ghost" size="sm" onClick={async () => { const name = window.prompt('Department name', department.name); if (name && name.trim() !== department.name) await departmentMutations.update.mutateAsync({ id: department.id, name: name.trim() }); }}>Edit</Button><Button variant="ghost" size="sm" onClick={async () => { if (window.confirm(`Delete ${department.name}?`)) await departmentMutations.remove.mutateAsync(department.id); }}>Delete</Button></div></div><p className="font-medium mt-1">{department.name}</p><p className="text-xs text-muted-foreground">{department.facultyCount ?? 0} faculty • {department.studentCount ?? 0} students{department.headOfDepartment ? ` • HOD: ${department.headOfDepartment}` : ''}</p></div>)}
              {!departments?.length && <p className="text-sm text-muted-foreground">No departments found.</p>}
            </div>
          </CardContent>
        </Card>
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

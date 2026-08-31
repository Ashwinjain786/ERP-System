import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  GraduationCap, Search, Download, Plus,
  MoreVertical, ChevronLeft, ChevronRight
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStudentsList, useDepartments } from '@/features/admin/hooks';
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
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-14 bg-muted rounded-lg animate-pulse" />
      ))}
    </div>
  );
}

function getFeeStatusColor(status?: string) {
  switch (status) {
    case 'paid': return 'bg-success/10 text-success border-success/20';
    case 'partial': return 'bg-warning/10 text-warning border-warning/20';
    case 'due': return 'bg-destructive/10 text-destructive border-destructive/20';
    default: return 'bg-muted text-muted-foreground';
  }
}

export default function AdminStudents() {
  const reduceMotion = useReducedMotion();
  const Wrapper = reduceMotion ? 'div' : motion.div;
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: students, isLoading, error } = useStudentsList();
  const { data: departments } = useDepartments();

  const filteredStudents = students?.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = !departmentFilter || student.department === departmentFilter;
    return matchesSearch && matchesDept;
  }) || [];

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const stats = {
    total: students?.length || 0,
    paid: students?.filter(s => s.feeStatus === 'paid').length || 0,
    partial: students?.filter(s => s.feeStatus === 'partial').length || 0,
    due: students?.filter(s => s.feeStatus === 'due').length || 0,
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Card className="max-w-md mx-auto mt-20 border-destructive">
          <CardContent className="pt-6 text-center">
            <p className="text-destructive font-medium">Failed to load students data</p>
            <p className="text-sm text-muted-foreground mt-1">Please try again later</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b-2 border-border/60 bg-gradient-to-r from-emerald-500/5 via-background to-background">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
          <Wrapper variants={container} initial="hidden" animate="show" className="space-y-5">
            <Wrapper variants={item}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="font-display text-2xl font-bold tracking-tight">Student Directory</h1>
                    <p className="text-sm text-muted-foreground">Manage student records and enrollment</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-1" /> Export
                  </Button>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-1" /> Add Student
                  </Button>
                </div>
              </div>
            </Wrapper>

            <Wrapper variants={item}>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="border-2 border-border/60 bg-card">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Total Students</p>
                    <p className="font-display text-2xl font-bold tabular-nums">{isLoading ? '...' : stats.total}</p>
                  </CardContent>
                </Card>
                <Card className="border-2 border-border/60 bg-card">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Fee Paid</p>
                    <p className="font-display text-2xl font-bold tabular-nums text-success">{isLoading ? '...' : stats.paid}</p>
                  </CardContent>
                </Card>
                <Card className="border-2 border-border/60 bg-card">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Partial Payment</p>
                    <p className="font-display text-2xl font-bold tabular-nums text-warning">{isLoading ? '...' : stats.partial}</p>
                  </CardContent>
                </Card>
                <Card className="border-2 border-border/60 bg-card">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Fee Due</p>
                    <p className="font-display text-2xl font-bold tabular-nums text-destructive">{isLoading ? '...' : stats.due}</p>
                  </CardContent>
                </Card>
              </div>
            </Wrapper>
          </Wrapper>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <Card className="border-2 border-border/60">
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-display">All Students</CardTitle>
                <CardDescription>{filteredStudents.length} students found</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, roll..."
                    className="pl-9 w-full sm:w-64"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  />
                </div>
                <select
                  className="h-10 rounded-lg border-2 border-input bg-background px-3 text-sm"
                  value={departmentFilter}
                  onChange={(e) => { setDepartmentFilter(e.target.value); setCurrentPage(1); }}
                >
                  <option value="">All Departments</option>
                  {departments?.map(dept => (
                    <option key={dept.id} value={dept.name}>{dept.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <TableSkeleton />
            ) : (
              <Wrapper variants={container} initial="hidden" animate="show">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-border/60">
                        <th className="text-left pb-3 px-2 text-sm font-semibold text-muted-foreground">Roll No.</th>
                        <th className="text-left pb-3 px-2 text-sm font-semibold text-muted-foreground">Name</th>
                        <th className="text-left pb-3 px-2 text-sm font-semibold text-muted-foreground">Department</th>
                        <th className="text-center pb-3 px-2 text-sm font-semibold text-muted-foreground">Sem</th>
                        <th className="text-center pb-3 px-2 text-sm font-semibold text-muted-foreground">CGPA</th>
                        <th className="text-center pb-3 px-2 text-sm font-semibold text-muted-foreground">Fee Status</th>
                        <th className="text-right pb-3 px-2 text-sm font-semibold text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                {paginatedStudents.map((student) => (
                        <motion.tr
                          key={student.id}
                          variants={item}
                          className="border-b border-border/40 hover:bg-muted/30 transition-colors"
                        >
                          <td className="py-3 px-2">
                            <span className="font-mono text-sm font-medium">{student.rollNumber}</span>
                          </td>
                          <td className="py-3 px-2">
                            <div>
                              <p className="font-medium">{student.name}</p>
                              <p className="text-xs text-muted-foreground">{student.email}</p>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-sm">{student.department}</td>
                          <td className="py-3 px-2 text-center">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-secondary text-sm font-medium">
                              {student.semester}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span className={cn(
                              "font-mono font-semibold tabular-nums",
                              (student.cgpa || 0) >= 8 ? 'text-success' :
                              (student.cgpa || 0) >= 6 ? 'text-warning' : 'text-destructive'
                            )}>
                              {student.cgpa?.toFixed(2) || '-'}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span className={cn(
                              "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border",
                              getFeeStatusColor(student.feeStatus)
                            )}>
                              {student.feeStatus ? student.feeStatus.charAt(0).toUpperCase() + student.feeStatus.slice(1) : '-'}
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

                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/40">
                    <p className="text-sm text-muted-foreground">
                      Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredStudents.length)} of {filteredStudents.length}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      {[...Array(Math.min(5, totalPages))].map((_, i) => {
                        const page = i + 1;
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Button>
                        );
                      })}
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => p + 1)}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </Wrapper>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

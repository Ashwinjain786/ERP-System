import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  Users, Search, Plus, MoreVertical, ChevronLeft, ChevronRight
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFacultyList, useDepartments } from '@/features/admin/hooks';
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

export default function AdminFaculty() {
  const reduceMotion = useReducedMotion();
  const Wrapper = reduceMotion ? 'div' : motion.div;
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: faculty, isLoading, error } = useFacultyList();
  const { data: departments } = useDepartments();

  const filteredFaculty = faculty?.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = !departmentFilter || f.department === departmentFilter;
    return matchesSearch && matchesDept;
  }) || [];

  const totalPages = Math.ceil(filteredFaculty.length / itemsPerPage);
  const paginatedFaculty = filteredFaculty.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const stats = {
    total: faculty?.length || 0,
    professors: faculty?.filter(f => f.designation.includes('Professor')).length || 0,
    avgWorkload: Math.round((faculty?.reduce((acc, f) => acc + (f.weeklyWorkloadHours || 0), 0) || 0) / (faculty?.length || 1)),
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Card className="max-w-md mx-auto mt-20 border-destructive">
          <CardContent className="pt-6 text-center">
            <p className="text-destructive font-medium">Failed to load faculty data</p>
            <p className="text-sm text-muted-foreground mt-1">Please try again later</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b-2 border-border/60 bg-gradient-to-r from-blue-500/5 via-background to-background">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
          <Wrapper variants={container} initial="hidden" animate="show" className="space-y-5">
            <Wrapper variants={item}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-500">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="font-display text-2xl font-bold tracking-tight">Faculty Directory</h1>
                    <p className="text-sm text-muted-foreground">Manage faculty and staff profiles</p>
                  </div>
                </div>
                <Button>
                  <Plus className="w-4 h-4 mr-2" /> Add Faculty
                </Button>
              </div>
            </Wrapper>

            <Wrapper variants={item}>
              <div className="grid gap-3 sm:grid-cols-3">
                <Card className="border-2 border-border/60 bg-card">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Total Faculty</p>
                    <p className="font-display text-2xl font-bold tabular-nums">{isLoading ? '...' : stats.total}</p>
                  </CardContent>
                </Card>
                <Card className="border-2 border-border/60 bg-card">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Professors</p>
                    <p className="font-display text-2xl font-bold tabular-nums">{isLoading ? '...' : stats.professors}</p>
                  </CardContent>
                </Card>
                <Card className="border-2 border-border/60 bg-card">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Avg. Workload</p>
                    <p className="font-display text-2xl font-bold tabular-nums">{isLoading ? '...' : `${stats.avgWorkload}h`}</p>
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
                <CardTitle className="text-lg font-display">All Faculty Members</CardTitle>
                <CardDescription>{filteredFaculty.length} members</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, code..."
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
                        <th className="text-left pb-3 px-2 text-sm font-semibold text-muted-foreground">Emp. Code</th>
                        <th className="text-left pb-3 px-2 text-sm font-semibold text-muted-foreground">Name</th>
                        <th className="text-left pb-3 px-2 text-sm font-semibold text-muted-foreground">Department</th>
                        <th className="text-left pb-3 px-2 text-sm font-semibold text-muted-foreground">Designation</th>
                        <th className="text-center pb-3 px-2 text-sm font-semibold text-muted-foreground">Qualification</th>
                        <th className="text-center pb-3 px-2 text-sm font-semibold text-muted-foreground">Workload</th>
                        <th className="text-center pb-3 px-2 text-sm font-semibold text-muted-foreground">Leave Bal.</th>
                        <th className="text-right pb-3 px-2 text-sm font-semibold text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedFaculty.map((f) => (
                        <motion.tr
                          key={f.id}
                          variants={item}
                          className="border-b border-border/40 hover:bg-muted/30 transition-colors"
                        >
                          <td className="py-3 px-2">
                            <span className="font-mono text-sm font-medium">{f.employeeCode}</span>
                          </td>
                          <td className="py-3 px-2">
                            <div>
                              <p className="font-medium">{f.name}</p>
                              <p className="text-xs text-muted-foreground">{f.email}</p>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-sm">{f.department}</td>
                          <td className="py-3 px-2 text-sm">
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary">
                              {f.designation}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-center text-sm">{f.qualification}</td>
                          <td className="py-3 px-2 text-center">
                            <span className={cn(
                              "font-mono font-semibold",
                              (f.weeklyWorkloadHours || 0) > 18 ? 'text-warning' : 'text-success'
                            )}>
                              {f.weeklyWorkloadHours}h
                            </span>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span className="font-mono text-sm">{f.leaveBalance}</span>
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
                      Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredFaculty.length)} of {filteredFaculty.length}
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

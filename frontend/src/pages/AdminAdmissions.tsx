import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  Users, UserPlus, CheckCircle, Clock, XCircle, Search,
  TrendingUp, BarChart3, FileText, Calendar, ChevronDown
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

import { useQuery } from '@tanstack/react-query';
import { apiConfig } from '@/api/apiCall';

function useAdmissions() {
  return useQuery({
    queryKey: ['admin', 'admissions'],
    queryFn: async () => {
      const res = await fetch(`${apiConfig.baseUrl}/admin/admissions`, {
        headers: {
          'Content-Type': 'application/json',
          ...apiConfig.headers,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch admissions');
      return res.json();
    },
  });
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
      ))}
    </div>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case 'approved': return { bg: 'bg-success/10', text: 'text-success', icon: CheckCircle };
    case 'pending': return { bg: 'bg-warning/10', text: 'text-warning', icon: Clock };
    case 'rejected': return { bg: 'bg-destructive/10', text: 'text-destructive', icon: XCircle };
    default: return { bg: 'bg-muted', text: 'text-muted-foreground', icon: Clock };
  }
}

export default function AdminAdmissions() {
  const reduceMotion = useReducedMotion();
  const Wrapper = reduceMotion ? 'div' : motion.div;
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: admissionsData, isLoading, isError } = useAdmissions();
  
  const applications = Array.isArray(admissionsData) ? admissionsData : [];

  const filteredAdmissions = applications.filter((app: any) => {
    const matchesSearch = app.applicantName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.applicationId?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalApplications: applications.length,
    approved: applications.filter((app: any) => app.status === 'approved').length,
    pending: applications.filter((app: any) => app.status === 'pending').length,
    rejected: applications.filter((app: any) => app.status === 'rejected').length,
  };
  const acceptanceRate = stats.totalApplications > 0 ? ((stats.approved / stats.totalApplications) * 100).toFixed(1) : '0.0';

  const statCards = [
    { label: 'Total Applications', value: stats.totalApplications, icon: Users, color: 'bg-info', subtext: '+12% from last year' },
    { label: 'Approved', value: stats.approved, icon: CheckCircle, color: 'bg-success', subtext: `${acceptanceRate}% acceptance` },
    { label: 'Pending Review', value: stats.pending, icon: Clock, color: 'bg-warning', subtext: 'Requires action' },
    { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'bg-destructive', subtext: 'Below criteria' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b-2 border-border/60 bg-gradient-to-r from-info/5 via-background to-background">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
          <Wrapper variants={container} initial="hidden" animate="show" className="space-y-5">
            <Wrapper variants={item}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-info">
                    <UserPlus className="w-6 h-6 text-background" />
                  </div>
                  <div>
                    <h1 className="font-display text-2xl font-bold tracking-tight">Admissions Pipeline</h1>
                    <p className="text-sm text-muted-foreground">Track and manage admission applications</p>
                  </div>
                </div>
                <Button>
                  <FileText className="w-4 h-4 mr-2" /> Generate Report
                </Button>
              </div>
            </Wrapper>

            <Wrapper variants={item}>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat, idx) => (
                  <Card key={idx} className="border-2 border-border/60 bg-card transition-all duration-200 hover:border-primary/30">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
                        <div className={cn("p-2 rounded-xl", stat.color)}>
                          <stat.icon className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <div className="mt-4">
                        <span className="font-display text-3xl font-bold tracking-tight tabular-nums">{stat.value}</span>
                      </div>
                      <p className="mt-1.5 text-xs text-muted-foreground">{stat.subtext}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </Wrapper>

            <Wrapper variants={item}>
              <Card className="border-2 border-border/60">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-success/10">
                        <TrendingUp className="w-5 h-5 text-success" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-display">Acceptance Rate</CardTitle>
                        <CardDescription>Overall admission conversion</CardDescription>
                      </div>
                    </div>
                    <span className="font-display text-3xl font-bold text-success">{acceptanceRate}%</span>
                  </div>
                </CardHeader>
              </Card>
            </Wrapper>
          </Wrapper>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <Card className="border-2 border-border/60">
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-display">Applicant List</CardTitle>
                <CardDescription>{filteredAdmissions.length} applications</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search applicants..."
                    className="pl-9 w-full sm:w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <select
                  className="h-10 rounded-lg border-2 border-input bg-background px-3 text-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Wrapper variants={container} initial="hidden" animate="show">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-border/60">
                      <th className="text-left pb-3 px-2 text-sm font-semibold text-muted-foreground">App ID</th>
                      <th className="text-left pb-3 px-2 text-sm font-semibold text-muted-foreground">Applicant</th>
                      <th className="text-left pb-3 px-2 text-sm font-semibold text-muted-foreground">Program</th>
                      <th className="text-left pb-3 px-2 text-sm font-semibold text-muted-foreground">Department</th>
                      <th className="text-center pb-3 px-2 text-sm font-semibold text-muted-foreground">Rank</th>
                      <th className="text-center pb-3 px-2 text-sm font-semibold text-muted-foreground">Quota</th>
                      <th className="text-center pb-3 px-2 text-sm font-semibold text-muted-foreground">Status</th>
                      <th className="text-right pb-3 px-2 text-sm font-semibold text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAdmissions.map((app) => {
                      const statusStyle = getStatusColor(app.status);
                      const StatusIcon = statusStyle.icon;
                      return (
                        <motion.tr
                          key={app.id}
                          variants={item}
                          className="border-b border-border/40 hover:bg-muted/30 transition-colors"
                        >
                          <td className="py-3 px-2">
                            <span className="font-mono text-sm text-muted-foreground">{app.applicationId}</span>
                          </td>
                          <td className="py-3 px-2">
                            <div>
                              <p className="font-medium">{app.applicantName}</p>
                              <p className="text-xs text-muted-foreground">{app.category}</p>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-sm">{app.program}</td>
                          <td className="py-3 px-2 text-sm">{app.department}</td>
                          <td className="py-3 px-2 text-center">
                            <span className="font-mono text-sm">{app.jeeRank || app.gateRank || '-'}</span>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-secondary">
                              {app.quota}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium", statusStyle.bg, statusStyle.text)}>
                              <StatusIcon className="w-3.5 h-3.5" />
                              {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-right">
                            <Button variant="ghost" size="sm">View</Button>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Wrapper>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { CalendarDays, Send, Clock, CheckCircle2, XCircle, Plus } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFacultyProfile } from '@/features/faculty/hooks';
import { cn } from '@/lib/utils';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

import { getFacultyLeaves } from '@/api/customApi';
import { useQuery } from '@tanstack/react-query';

const LEAVE_TYPES = ['Casual Leave', 'Sick Leave', 'Earned Leave', 'Maternity Leave', 'Paternity Leave'];

export default function FacultyLeaves() {
  const reduceMotion = useReducedMotion();
  const Wrapper = reduceMotion ? 'div' : motion.div;
  const { data: profile } = useFacultyProfile();
  const { data: leavesData } = useQuery({
    queryKey: ['faculty', 'leaves', profile?.id],
    queryFn: () => getFacultyLeaves(profile!.id),
    enabled: !!profile?.id,
  });
  const leaves = Array.isArray(leavesData) ? leavesData : [];
  
  const [showForm, setShowForm] = useState(false);
  const [leaveType, setLeaveType] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowForm(false);
    setLeaveType('');
    setFromDate('');
    setToDate('');
    setReason('');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Clock className="w-4 h-4 text-warning" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b-2 border-border/60 bg-gradient-to-r from-primary/5 via-background to-background">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
          <Wrapper variants={container} initial="hidden" animate="show" className="space-y-4">
            <Wrapper variants={item}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="font-display text-3xl font-bold tracking-tight">Leave Management</h1>
                  <p className="mt-1 text-muted-foreground">Request and track your leave applications</p>
                </div>
                <Button onClick={() => setShowForm(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  New Request
                </Button>
              </div>
            </Wrapper>
          </Wrapper>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-2 border-border/60">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Leave Balance</span>
                <div className="p-2 rounded-xl bg-amber-500">
                  <CalendarDays className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="mt-3">
                <span className="font-display text-3xl font-bold tracking-tight tabular-nums">{profile?.leaveBalance || 0}</span>
                <span className="text-sm text-muted-foreground ml-2">days</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-border/60">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Approved</span>
                <div className="p-2 rounded-xl bg-success">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="mt-3">
                <span className="font-display text-3xl font-bold tracking-tight tabular-nums">{leaves.filter((l: any) => l.status === 'approved').reduce((acc: number, l: any) => acc + (l.days || 0), 0)}</span>
                <span className="text-sm text-muted-foreground ml-2">days</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-border/60">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Pending</span>
                <div className="p-2 rounded-xl bg-warning">
                  <Clock className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="mt-3">
                <span className="font-display text-3xl font-bold tracking-tight tabular-nums text-warning">{leaves.filter((l: any) => l.status === 'pending').reduce((acc: number, l: any) => acc + (l.days || 0), 0)}</span>
                <span className="text-sm text-muted-foreground ml-2">days</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-border/60">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Total Used</span>
                <div className="p-2 rounded-xl bg-primary/80">
                  <CalendarDays className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="mt-3">
                <span className="font-display text-3xl font-bold tracking-tight tabular-nums">{leaves.filter((l: any) => l.status !== 'rejected').reduce((acc: number, l: any) => acc + (l.days || 0), 0)}</span>
                <span className="text-sm text-muted-foreground ml-2">days</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="border-2 border-primary/50 shadow-lg">
              <CardHeader>
                <CardTitle className="font-display">New Leave Request</CardTitle>
                <CardDescription>Submit a new leave application</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Leave Type</label>
                      <select
                        value={leaveType}
                        onChange={(e) => setLeaveType(e.target.value)}
                        className="w-full h-10 rounded-lg border-2 border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        required
                      >
                        <option value="">Select leave type</option>
                        {LEAVE_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Number of Days</label>
                      <Input type="number" placeholder="Enter days" min="1" required />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">From Date</label>
                      <Input 
                        type="date" 
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">To Date</label>
                      <Input 
                        type="date" 
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        required 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Reason</label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Enter reason for leave..."
                      className="w-full min-h-[100px] rounded-lg border-2 border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="gap-2">
                      <Send className="w-4 h-4" />
                      Submit Request
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <Card className="border-2 border-border/60">
          <CardHeader>
            <CardTitle className="font-display">Leave History</CardTitle>
            <CardDescription>Your previous leave requests and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaves.map((leave: any, idx: number) => (
                <div
                  key={leave.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors border-2 border-transparent hover:border-primary/20"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-3 rounded-xl",
                      leave.status === 'approved' ? "bg-success/10" : 
                      leave.status === 'rejected' ? "bg-destructive/10" : "bg-warning/10"
                    )}>
                      <CalendarDays className={cn(
                        "w-5 h-5",
                        leave.status === 'approved' ? "text-success" : 
                        leave.status === 'rejected' ? "text-destructive" : "text-warning"
                      )} />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{leave.type}</p>
                      <p className="text-sm text-muted-foreground">
                        {leave.fromDate} to {leave.toDate} ({leave.days} days)
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">{leave.reason}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(leave.status)}
                    <span className={cn(
                      "font-medium text-sm capitalize",
                      leave.status === 'approved' ? "text-success" : 
                      leave.status === 'rejected' ? "text-destructive" : "text-warning"
                    )}>
                      {leave.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

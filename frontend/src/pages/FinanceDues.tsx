import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import type { Variants } from 'motion';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFeeDefaulters } from '@/features/finance/hooks';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
};

const getSeverityColor = (days: number) => {
  if (days > 45) return 'bg-destructive/10 text-destructive';
  if (days > 30) return 'bg-warning/10 text-warning';
  return 'bg-info/10 text-info';
};

export default function FinanceDues() {
  const { data: defaulters, isLoading } = useFeeDefaulters();
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const shouldReduceMotion = useReducedMotion();

  const filteredDefaulters = defaulters?.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (d.rollNumber || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || d.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  }) || [];

  const departments = [...new Set(defaulters?.map(d => d.department).filter(Boolean) as string[])];

  const totalDue = filteredDefaulters.reduce((sum, d) => sum + d.dueAmount, 0);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: shouldReduceMotion ? 0 : 0.3, ease: 'easeOut' as const }
    }
  };

  return (
    <div className="p-6 space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.4 }}
      >
        <h1 className="text-3xl font-bold font-display text-foreground">Fee Defaulters</h1>
        <p className="text-muted-foreground font-body mt-1">Students with outstanding fee payments</p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: shouldReduceMotion ? 0 : 0.1 }}
        className="grid gap-4 md:grid-cols-3"
      >
        <Card>
          <CardContent className="pt-6">
            <Label className="text-muted-foreground font-body">Total Defaulters</Label>
            <p className="text-3xl font-bold font-display text-destructive">{filteredDefaulters.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Label className="text-muted-foreground font-body">Total Due Amount</Label>
            <p className="text-3xl font-bold font-display text-warning">{formatCurrency(totalDue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Label className="text-muted-foreground font-body">Avg. Days Overdue</Label>
            <p className="text-3xl font-bold font-display text-info">
              {filteredDefaulters.length > 0 
                ? Math.round(filteredDefaulters.reduce((sum, d) => sum + d.daysOverdue, 0) / filteredDefaulters.length)
                : 0}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: shouldReduceMotion ? 0 : 0.15 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="flex-1">
          <Input
            placeholder="Search by name or roll number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="font-body"
          />
        </div>
        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="h-10 rounded-lg border-2 border-input bg-background px-3 py-2 text-base font-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="all">All Departments</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </motion.div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground font-body">Loading defaulters...</div>
      ) : filteredDefaulters.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground font-body">No defaulters found</p>
          </CardContent>
        </Card>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          <AnimatePresence mode="popLayout">
            {filteredDefaulters.map((defaulter) => (
              <motion.div
                key={defaulter.studentId}
                variants={itemVariants}
                layout
                exit={{ opacity: 0, x: 20 }}
              >
                <Card className="hover:shadow-md transition-shadow duration-200">
                  <CardContent className="py-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1 grid md:grid-cols-4 gap-4">
                        <div>
                          <Label className="text-muted-foreground font-body text-xs">Name</Label>
                          <p className="font-semibold font-body">{defaulter.name}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground font-body text-xs">Roll Number</Label>
                          <p className="font-mono text-sm font-body">{defaulter.rollNumber || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground font-body text-xs">Department</Label>
                          <p className="font-body text-sm">{defaulter.department || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground font-body text-xs">Semester</Label>
                          <p className="font-body text-sm">Semester {defaulter.semester || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <Label className="text-muted-foreground font-body text-xs">Due Amount</Label>
                          <p className="text-xl font-bold font-display text-destructive">{formatCurrency(defaulter.dueAmount)}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium font-body ${getSeverityColor(defaulter.daysOverdue)}`}>
                          {defaulter.daysOverdue} days
                        </span>
                        <Button size="sm" variant="outline" className="font-body">Send Reminder</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

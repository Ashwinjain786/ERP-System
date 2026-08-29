import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import type { Variants } from 'motion';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFeeStructures } from '@/features/finance/hooks';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
};

export default function FinanceStructures() {
  const { data: structures, isLoading } = useFeeStructures();
  const [searchTerm, setSearchTerm] = useState('');
  const [programFilter, setProgramFilter] = useState('all');
  const shouldReduceMotion = useReducedMotion();

  const filteredStructures = structures?.filter(s => {
    const matchesSearch = s.program.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (s.quota || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProgram = programFilter === 'all' || s.program === programFilter;
    return matchesSearch && matchesProgram;
  }) || [];

  const programs = [...new Set(structures?.map(s => s.program) || [])];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
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
        <h1 className="text-3xl font-bold font-display text-foreground">Fee Structure Master</h1>
        <p className="text-muted-foreground font-body mt-1">Manage program-wise tuition, hostel, and exam fees</p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: shouldReduceMotion ? 0 : 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="flex-1">
          <Input
            placeholder="Search by program or quota..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="font-body"
          />
        </div>
        <select
          value={programFilter}
          onChange={(e) => setProgramFilter(e.target.value)}
          className="h-10 rounded-lg border-2 border-input bg-background px-3 py-2 text-base font-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="all">All Programs</option>
          {programs.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <Button className="font-body">Add Structure</Button>
      </motion.div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground font-body">Loading fee structures...</div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {filteredStructures.map((structure) => (
              <motion.div
                key={structure.id}
                variants={itemVariants}
                layout
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Card className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-display">{structure.program}</CardTitle>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary font-body capitalize">
                        {structure.quota || 'general'}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <Label className="text-muted-foreground font-body">Tuition Fee</Label>
                        <p className="font-semibold font-body">{formatCurrency(structure.tuitionFee || 0)}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground font-body">Hostel Fee</Label>
                        <p className="font-semibold font-body">{formatCurrency(structure.hostelFee || 0)}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground font-body">Exam Fee</Label>
                        <p className="font-semibold font-body">{formatCurrency(structure.examFee || 0)}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground font-body">Library Deposit</Label>
                        <p className="font-semibold font-body">{formatCurrency(structure.libraryDeposit || 0)}</p>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-border">
                      <div className="flex justify-between items-center">
                        <Label className="text-muted-foreground font-body">Total Amount</Label>
                        <p className="text-xl font-bold font-display text-primary">{formatCurrency(structure.totalAmount)}</p>
                      </div>
                      <p className="text-xs text-muted-foreground font-body mt-1">Due: {structure.dueDate}</p>
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

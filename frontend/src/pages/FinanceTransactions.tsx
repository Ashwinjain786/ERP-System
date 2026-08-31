import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import type { Variants } from 'motion';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFeeTransactions, useUpdateFeeTransactionStatus } from '@/features/finance/hooks';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
};

const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return 'Awaiting reconciliation';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'success': return 'bg-success/10 text-success';
    case 'pending': return 'bg-warning/10 text-warning';
    case 'failed': return 'bg-destructive/10 text-destructive';
    default: return 'bg-muted text-muted-foreground';
  }
};

const getPaymentIcon = (method: string | undefined) => {
  switch (method) {
    case 'UPI': return '📱';
    case 'NetBanking': return '🏦';
    case 'CreditCard': return '💳';
    case 'DebitCard': return '💳';
    case 'Challan': return '📋';
    default: return '💰';
  }
};

export default function FinanceTransactions() {
  const { data: transactions, isLoading } = useFeeTransactions();
  const updateStatus = useUpdateFeeTransactionStatus();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [actionError, setActionError] = useState('');
  const shouldReduceMotion = useReducedMotion();

  const filteredTransactions = transactions?.filter(t => {
    const matchesSearch = (t.studentName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesMethod = methodFilter === 'all' || t.paymentMethod === methodFilter;
    return matchesSearch && matchesStatus && matchesMethod;
  }) || [];

  const totalAmount = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
  const successCount = filteredTransactions.filter(t => t.status === 'success').length;

  const methods = [...new Set(transactions?.map(t => t.paymentMethod).filter(Boolean) as string[])];
  const statuses = ['success', 'pending', 'failed'];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.03 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: shouldReduceMotion ? 0 : 0.2, ease: 'easeOut' as const }
    }
  };

  const handleReceiptClick = (transaction: typeof transactions extends (infer T)[] | undefined ? T : never) => {
    const t = transaction as { receiptNumber: string; studentName?: string; amount: number; paymentMethod?: string; status: string; paidAt?: string | null };
    alert(`Receipt: ${t.receiptNumber}\nStudent: ${t.studentName || 'N/A'}\nAmount: ${formatCurrency(t.amount)}\nMethod: ${t.paymentMethod || 'N/A'}\nStatus: ${t.status}\nDate: ${formatDate(t.paidAt)}`);
  };

  const settleTransaction = async (id: string, status: 'success' | 'failed') => {
    setActionError('');
    try {
      await updateStatus.mutateAsync({ id, status });
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to reconcile payment.');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.4 }}
      >
        <h1 className="text-3xl font-bold font-display text-foreground">Payment Ledger</h1>
        <p className="text-muted-foreground font-body mt-1">View and manage all fee transactions</p>
      </motion.div>

      {actionError && <p className="text-sm text-destructive">{actionError}</p>}

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: shouldReduceMotion ? 0 : 0.1 }}
        className="grid gap-4 md:grid-cols-4"
      >
        <Card>
          <CardContent className="pt-6">
            <Label className="text-muted-foreground font-body">Total Transactions</Label>
            <p className="text-3xl font-bold font-display">{filteredTransactions.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Label className="text-muted-foreground font-body">Total Amount</Label>
            <p className="text-3xl font-bold font-display text-primary">{formatCurrency(totalAmount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Label className="text-muted-foreground font-body">Successful</Label>
            <p className="text-3xl font-bold font-display text-success">{successCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Label className="text-muted-foreground font-body">Success Rate</Label>
            <p className="text-3xl font-bold font-display text-info">
              {filteredTransactions.length > 0 
                ? Math.round((successCount / filteredTransactions.length) * 100)
                : 0}%
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
            placeholder="Search by student name or receipt number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="font-body"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-lg border-2 border-input bg-background px-3 py-2 text-base font-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="all">All Status</option>
          {statuses.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          className="h-10 rounded-lg border-2 border-input bg-background px-3 py-2 text-base font-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="all">All Methods</option>
          {methods.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </motion.div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground font-body">Loading transactions...</div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          <AnimatePresence mode="popLayout">
            {filteredTransactions.map((transaction) => (
              <motion.div
                key={transaction.id}
                variants={itemVariants}
                layout
                exit={{ opacity: 0 }}
              >
                <Card className="hover:shadow-md transition-shadow duration-200">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center text-2xl">
                          {getPaymentIcon(transaction.paymentMethod)}
                        </div>
                        <div>
                          <p className="font-semibold font-body">{transaction.studentName || 'Unknown'}</p>
                          <p className="text-sm text-muted-foreground font-mono">{transaction.receiptNumber}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                          <p className="text-xs text-muted-foreground font-body">{formatDate(transaction.paidAt)}</p>
                          <p className="text-sm font-body">{transaction.paymentMethod || 'N/A'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold font-display">{formatCurrency(transaction.amount)}</p>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium font-body capitalize ${getStatusColor(transaction.status)}`}>
                            {transaction.status}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {transaction.status === 'pending' && (
                            <>
                              <Button size="sm" disabled={updateStatus.isPending} onClick={() => settleTransaction(transaction.id, 'success')}>Approve</Button>
                              <Button size="sm" variant="outline" disabled={updateStatus.isPending} onClick={() => settleTransaction(transaction.id, 'failed')}>Reject</Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="font-body"
                            onClick={() => handleReceiptClick(transaction)}
                          >
                            Receipt
                          </Button>
                        </div>
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

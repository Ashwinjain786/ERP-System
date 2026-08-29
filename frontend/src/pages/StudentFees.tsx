import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { DollarSign, CreditCard, CheckCircle, AlertCircle, Download, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useStudentFees, useSubmitStudentFeePayment } from '@/features/student/hooks';
import { cn } from '@/lib/utils';
import type { FeeTransaction } from '@/api/apiInterface';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
} as const;

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

function TransactionRow({ transaction }: { transaction: FeeTransaction }) {
  const isSuccess = transaction.status === 'success';
  
  return (
    <motion.div variants={item} className="flex items-center justify-between p-4 rounded-xl border-2 border-border/60 bg-card hover:border-primary/20 transition-all">
      <div className="flex items-center gap-4">
        <div className={cn(
          "p-3 rounded-xl",
          isSuccess ? 'bg-success/10' : 'bg-muted'
        )}>
          {isSuccess ? (
            <CheckCircle className="w-5 h-5 text-success" />
          ) : (
            <AlertCircle className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
        <div>
          <p className="font-semibold text-foreground">{transaction.receiptNumber}</p>
          <p className="text-sm text-muted-foreground">
            {transaction.paidAt ? format(new Date(transaction.paidAt), 'MMM d, yyyy • h:mm a') : 'Awaiting reconciliation'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{transaction.paymentMethod}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="font-display text-lg font-bold tracking-tight">₹{transaction.amount.toLocaleString()}</p>
          <span className={cn(
            "text-xs font-medium",
            isSuccess ? 'text-success' : 'text-destructive'
          )}>
            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
          </span>
        </div>
        <Button variant="ghost" size="icon">
          <Download className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}

function FeeSkeleton() {
  return (
    <div className="p-4 rounded-xl border-2 border-border/60 bg-card animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-muted" />
          <div>
            <div className="h-5 w-24 bg-muted rounded" />
            <div className="h-4 w-32 bg-muted rounded mt-2" />
          </div>
        </div>
        <div className="h-6 w-20 bg-muted rounded" />
      </div>
    </div>
  );
}

export default function StudentFees() {
  const reduceMotion = useReducedMotion();
  const Wrapper = reduceMotion ? 'div' : motion.div;
  const { data: fees, isLoading, error } = useStudentFees();
  const submitPayment = useSubmitStudentFeePayment();
  const [paymentMessage, setPaymentMessage] = React.useState('');

  const isPaid = fees?.status === 'paid';
  const isPartial = fees?.status === 'partial';
  const paidPercentage = fees?.totalAnnualFee ? Math.round((fees.totalPaid / fees.totalAnnualFee) * 100) : 0;

  const requestPayment = async () => {
    if (!fees?.studentId || !fees.dueBalance) return;
    setPaymentMessage('');
    try {
      await submitPayment.mutateAsync({ studentId: fees.studentId, amount: fees.dueBalance, paymentMethod: 'UPI' });
      setPaymentMessage('Payment request submitted. The Finance Office will reconcile it shortly.');
    } catch (requestError) {
      setPaymentMessage(requestError instanceof Error ? requestError.message : 'Unable to submit payment request.');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b-2 border-border/60 bg-gradient-to-r from-primary/5 via-background to-background">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
          <Wrapper variants={container} initial="hidden" animate="show">
            <Wrapper variants={item}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="font-display text-3xl font-bold tracking-tight">Fees & Payments</h1>
                  <p className="mt-1 text-muted-foreground">
                    View fee ledger and payment history
                  </p>
                </div>
                {!isPaid && (
                  <Button className="gap-2" onClick={requestPayment} disabled={submitPayment.isPending || !fees?.dueBalance}>
                    <CreditCard className="w-4 h-4" />
                    {submitPayment.isPending ? 'Submitting…' : 'Pay Now'}
                  </Button>
                )}
              </div>
            </Wrapper>

            <Wrapper variants={item}>
              <div className="grid gap-4 md:grid-cols-3 mt-6">
                <Card className="border-2 border-border/60 bg-card">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className={cn(
                      "p-3 rounded-xl",
                      isPaid ? 'bg-success/10' : isPartial ? 'bg-warning/10' : 'bg-destructive/10'
                    )}>
                      {isPaid ? (
                        <CheckCircle className="w-5 h-5 text-success" />
                      ) : isPartial ? (
                        <AlertCircle className="w-5 h-5 text-warning" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-destructive" />
                      )}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Status</span>
                      <div className="font-display text-2xl font-bold tracking-tight">
                        {isLoading ? '-' : isPaid ? 'Paid' : isPartial ? 'Partial' : 'Due'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-2 border-border/60 bg-card">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-blue-500">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Total Fee</span>
                      <div className="font-display text-2xl font-bold tracking-tight tabular-nums">
                        {isLoading ? '-' : `₹${fees?.totalAnnualFee?.toLocaleString() || 0}`}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-2 border-border/60 bg-card">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-emerald-500">
                      <DollarSign className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Amount Paid</span>
                      <div className="font-display text-2xl font-bold tracking-tight tabular-nums">
                        {isLoading ? '-' : `₹${fees?.totalPaid?.toLocaleString() || 0}`}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </Wrapper>

            {!isPaid && (
              <Wrapper variants={item} className="mt-6">
                <Card className="border-2 border-warning/60 bg-warning/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-display flex items-center gap-2 text-warning">
                      <AlertCircle className="w-5 h-5" />
                      Payment Due
                    </CardTitle>
                    <CardDescription>
                      You have outstanding fees that need to be paid
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Balance Due</span>
                      <span className="font-display text-xl font-bold text-warning">
                        ₹{fees?.dueBalance?.toLocaleString() || 0}
                      </span>
                    </div>
                    <div className="h-3 rounded-full bg-muted/20 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-warning transition-all duration-500"
                        style={{ width: `${paidPercentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{paidPercentage}% paid</p>
                  </CardContent>
                </Card>
              </Wrapper>
            )}
            {paymentMessage && (
              <p className={`mt-4 text-sm ${paymentMessage.startsWith('Payment request') ? 'text-success' : 'text-destructive'}`}>{paymentMessage}</p>
            )}
          </Wrapper>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <Card className="border-2 border-border/60">
          <CardHeader>
            <CardTitle className="text-lg font-display">Payment History</CardTitle>
            <CardDescription>Your previous fee transactions and receipts</CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-center py-8">
                <p className="text-destructive font-medium">Failed to load fee history. Please try again.</p>
              </div>
            ) : isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => <FeeSkeleton key={i} />)}
              </div>
            ) : fees?.transactions?.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="w-12 h-12 mx-auto text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">No Transactions</h3>
                <p className="mt-2 text-muted-foreground">You haven't made any fee payments yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {fees?.transactions?.map((transaction: FeeTransaction) => (
                  <TransactionRow key={transaction.id} transaction={transaction} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

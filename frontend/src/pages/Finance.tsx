import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  DollarSign, TrendingUp, AlertTriangle, ArrowRight,
  Building2, CreditCard, FileText
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFeeTransactions, useFeeDefaulters } from '@/features/finance/hooks';
import { cn } from '@/lib/utils';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

function StatCard({ label, value, subtext, icon: Icon, color, trend }: {
  label: string;
  value: string | number;
  subtext?: string;
  icon: React.ElementType;
  color: string;
  trend?: { value: number; positive: boolean };
}) {
  return (
    <Card className="border-2 border-border/60 bg-card transition-all duration-200 hover:border-primary/30 hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
          <div className={cn("p-2.5 rounded-xl", color)}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="font-display text-3xl font-bold tracking-tight tabular-nums">{value}</span>
          {trend && (
            <span className={cn("text-sm font-medium", trend.positive ? 'text-success' : 'text-destructive')}>
              {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </span>
          )}
        </div>
        {subtext && <p className="mt-1.5 text-xs text-muted-foreground">{subtext}</p>}
      </CardContent>
    </Card>
  );
}

export default function Finance() {
  const reduceMotion = useReducedMotion();
  const Wrapper = reduceMotion ? 'div' : motion.div;
  const { data: transactions } = useFeeTransactions();
  const { data: defaulters } = useFeeDefaulters();

  const totalCollected = transactions?.filter(t => t.status === 'success').reduce((acc, t) => acc + t.amount, 0) || 0;
  const totalPending = transactions?.filter(t => t.status === 'pending').reduce((acc, t) => acc + t.amount, 0) || 0;
  const totalDefaulters = defaulters?.reduce((acc, d) => acc + d.dueAmount, 0) || 0;
  const collectionRate = totalCollected + totalDefaulters > 0
    ? (totalCollected / (totalCollected + totalDefaulters)) * 100
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b-2 border-border/60 bg-gradient-to-r from-primary/5 via-background to-background">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
          <Wrapper variants={container} initial="hidden" animate="show" className="space-y-6">
            <Wrapper variants={item}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="font-display text-3xl font-bold tracking-tight">
                    Finance Office
                  </h1>
                  <p className="mt-1 text-muted-foreground">
                    Fee management and financial operations
                  </p>
                </div>
              </div>
            </Wrapper>

            <Wrapper variants={item}>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard 
                  label="Total Collected" 
                  value={`₹${(totalCollected / 100000).toFixed(1)}L`}
                  subtext={`${transactions?.filter(t => t.status === 'success').length || 0} successful transactions`}
                  icon={DollarSign}
                  color="bg-emerald-500"
                />
                <StatCard 
                  label="Pending Payments" 
                  value={`₹${(totalPending / 100000).toFixed(1)}L`}
                  subtext={`${transactions?.filter(t => t.status === 'pending').length || 0} pending`}
                  icon={TrendingUp}
                  color="bg-amber-500"
                />
                <StatCard 
                  label="Fee Defaulters" 
                  value={`₹${(totalDefaulters / 100000).toFixed(1)}L`}
                  subtext={`${defaulters?.length || 0} students`}
                  icon={AlertTriangle}
                  color="bg-destructive"
                />
                <StatCard 
                  label="Collection Rate" 
                  value={`${collectionRate.toFixed(1)}%`}
                  subtext="Of total fee expected"
                  icon={Building2}
                  color="bg-blue-500"
                />
              </div>
            </Wrapper>
          </Wrapper>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 space-y-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-2 border-border/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg font-display">Recent Transactions</CardTitle>
                <CardDescription>Latest fee payments</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/finance/transactions">View All <ArrowRight className="ml-1 w-4 h-4" /></Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions?.slice(0, 5).map((txn) => (
                  <div key={txn.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                    <div className={cn(
                      "p-2 rounded-lg",
                      txn.status === 'success' ? 'bg-success/10' : txn.status === 'pending' ? 'bg-warning/10' : 'bg-destructive/10'
                    )}>
                      <CreditCard className={cn(
                        "w-5 h-5",
                        txn.status === 'success' ? 'text-success' : txn.status === 'pending' ? 'text-warning' : 'text-destructive'
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground">{txn.studentName}</p>
                      <p className="text-sm text-muted-foreground">{txn.paymentMethod} • {txn.receiptNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-semibold tabular-nums">₹{txn.amount.toLocaleString()}</p>
                      <p className={cn(
                        "text-xs",
                        txn.status === 'success' ? 'text-success' : txn.status === 'pending' ? 'text-warning' : 'text-destructive'
                      )}>{txn.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-border/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg font-display">Fee Defaulters</CardTitle>
                <CardDescription>Students with pending dues</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/finance/dues">View All <ArrowRight className="ml-1 w-4 h-4" /></Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {defaulters?.slice(0, 5).map((defaulter) => (
                  <div key={defaulter.studentId} className="flex items-center gap-4 p-3 rounded-lg bg-destructive/5 border-l-4 border-destructive">
                    <div className="p-2 rounded-lg bg-destructive/10">
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground">{defaulter.name}</p>
                      <p className="text-sm text-muted-foreground">{defaulter.department} • {defaulter.daysOverdue} days overdue</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-semibold text-destructive tabular-nums">₹{defaulter.dueAmount.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3">
          <h2 className="font-display text-xl font-semibold tracking-tight">Quick Actions</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link 
              to="/finance/structures"
              className="group flex items-center gap-4 p-4 rounded-xl border-2 border-border/60 bg-card hover:border-primary/40 hover:shadow-md transition-all duration-200"
            >
              <div className="p-3 rounded-xl bg-emerald-500">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground">Fee Structures</p>
                <p className="text-sm text-muted-foreground">Configure fees</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </Link>
            <Link 
              to="/finance/dues"
              className="group flex items-center gap-4 p-4 rounded-xl border-2 border-border/60 bg-card hover:border-primary/40 hover:shadow-md transition-all duration-200"
            >
              <div className="p-3 rounded-xl bg-amber-500">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground">Fee Dues</p>
                <p className="text-sm text-muted-foreground">Defaulters list</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </Link>
            <Link 
              to="/finance/transactions"
              className="group flex items-center gap-4 p-4 rounded-xl border-2 border-border/60 bg-card hover:border-primary/40 hover:shadow-md transition-all duration-200"
            >
              <div className="p-3 rounded-xl bg-blue-500">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground">Transactions</p>
                <p className="text-sm text-muted-foreground">Payment history</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </Link>
            <Link 
              to="/finance/reports"
              className="group flex items-center gap-4 p-4 rounded-xl border-2 border-border/60 bg-card hover:border-primary/40 hover:shadow-md transition-all duration-200"
            >
              <div className="p-3 rounded-xl bg-violet-500">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground">Reports</p>
                <p className="text-sm text-muted-foreground">Financial analytics</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

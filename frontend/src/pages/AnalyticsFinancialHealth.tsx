import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { 
  DollarSign, TrendingUp, TrendingDown, PiggyBank, 
  ArrowLeft, BarChart3, PieChart
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useFeeTransactions } from '@/features/finance/hooks';

const COLORS = ['hsl(26.1 100% 34.7%)', 'hsl(41.5 100% 33.1%)', 'hsl(181.3 100% 28%)', 'hsl(229.3 44.5% 55.5%)', 'hsl(326.6 37% 46.7%)'];

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
            <Icon className="w-5 h-5 text-background" />
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

export default function AnalyticsFinancialHealth() {
  const reduceMotion = useReducedMotion();
  const Wrapper = reduceMotion ? 'div' : motion.div;
  const { data: transactions = [] } = useFeeTransactions();

  const liveRevenueData = React.useMemo(() => {
    const byMonth = new Map<string, { month: string; revenue: number; expenses: number; sortKey: number }>();
    transactions.filter((transaction) => transaction.status === 'success').forEach((transaction) => {
      const date = new Date(transaction.paidAt || transaction.createdAt || 0);
      if (Number.isNaN(date.getTime())) return;
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const row = byMonth.get(key) || { month: date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }), revenue: 0, expenses: 0, sortKey: date.getTime() };
      row.revenue += transaction.amount / 10000000;
      byMonth.set(key, row);
    });
    return Array.from(byMonth.values()).sort((a, b) => a.sortKey - b.sortKey);
  }, [transactions]);
  const revenueData = liveRevenueData;
  const totalRevenue = revenueData.reduce((sum, d) => sum + d.revenue, 0);
  const totalExpenses = 0;
  const netSurplus = totalRevenue - totalExpenses;
  const surplusPercentage = totalRevenue > 0 ? ((netSurplus / totalRevenue) * 100).toFixed(1) : '0.0';
  const totalBilled = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  const successfulAmount = transactions.filter((transaction) => transaction.status === 'success').reduce((sum, transaction) => sum + transaction.amount, 0);
  const feeCollectionRate = totalBilled > 0 ? Math.round((successfulAmount / totalBilled) * 100) : 0;
  const outstandingFees = transactions.filter((transaction) => transaction.status !== 'success').reduce((sum, transaction) => sum + transaction.amount, 0) / 10000000;
  const fiscalLabel = `Recorded transactions (${transactions.length})`;
  const budgetUtilization: { department: string; allocated: number; utilized: number }[] = [];
  const expenseBreakdown: { name: string; value: number }[] = [];
  const revenueBreakdown: { name: string; value: number }[] = totalRevenue > 0 ? Array.from(new Set(transactions.map((transaction) => transaction.paymentMethod).filter(Boolean))).map((method) => ({ name: method!, value: Math.round(transactions.filter((transaction) => transaction.status === 'success' && transaction.paymentMethod === method).reduce((sum, transaction) => sum + transaction.amount, 0) / (totalRevenue * 10000000) * 100) })) : [];
  const cashFlowData: { month: string; inflow: number; outflow: number }[] = [];

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b-2 border-border/60 bg-gradient-to-r from-primary/5 via-background to-background">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
          <Wrapper variants={container} initial="hidden" animate="show" className="space-y-6">
            <Wrapper variants={item}>
              <div className="flex items-center gap-4 mb-2">
                <Button variant="ghost" size="icon" asChild>
                  <Link to="/analytics">
                    <ArrowLeft className="w-5 h-5" />
                  </Link>
                </Button>
                <div>
                  <h1 className="font-display text-3xl font-bold tracking-tight">
                    Financial Health
                  </h1>
                  <p className="mt-1 text-muted-foreground">
                    Revenue vs expenses, budget utilization, and financial insights
                  </p>
                </div>
              </div>
            </Wrapper>

            <Wrapper variants={item}>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard 
                  label="Total Revenue" 
                  value={`₹${totalRevenue.toFixed(1)}Cr`}
                  subtext={fiscalLabel}
                  icon={DollarSign}
                  color="bg-success"
                />
                <StatCard 
                  label="Total Expenses" 
                  value={`₹${totalExpenses.toFixed(1)}Cr`}
                  subtext="Expense ledger not connected"
                  icon={TrendingDown}
                  color="bg-info"
                />
                <StatCard 
                  label="Net Position (before expenses)"
                  value={`₹${netSurplus.toFixed(1)}Cr`}
                  subtext={totalExpenses > 0 ? `${surplusPercentage}% margin` : 'Expenses not connected'}
                  icon={PiggyBank}
                  color="bg-primary"
                />
                <StatCard 
                  label="Budget Utilization" 
                  value="N/A"
                  subtext="Budget ledger not connected"
                  icon={TrendingUp}
                  color="bg-warning"
                />
              </div>
            </Wrapper>
          </Wrapper>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 space-y-8">
        <Wrapper variants={container} initial="hidden" animate="show" className="space-y-8">
          <Wrapper variants={item}>
            <Card className="border-2 border-border/60">
              <CardHeader>
                <CardTitle className="text-lg font-display flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Revenue vs Expenses
                </CardTitle>
                <CardDescription>Monthly financial performance</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `₹${v}`} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '2px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value) => [`₹${value || 0}Cr`, '']}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="hsl(136 40.5% 43.5%)" 
                      fill="hsl(136 40.5% 43.5% / 0.2)" 
                      strokeWidth={2}
                      name="Revenue"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="expenses" 
                      stroke="hsl(1.2 63.4% 48.2%)" 
                      fill="hsl(1.2 63.4% 48.2% / 0.2)" 
                      strokeWidth={2}
                      name="Expenses"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Wrapper>

          <Wrapper variants={item}>
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-2 border-border/60">
                <CardHeader>
                  <CardTitle className="text-lg font-display flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Budget Utilization by Department
                  </CardTitle>
                  <CardDescription>{budgetUtilization.length ? 'Allocated vs utilized budget' : 'No budget ledger data available'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={budgetUtilization} layout="vertical" barGap={8}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={true} vertical={false} />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `₹${v}Cr`} />
                      <YAxis dataKey="department" type="category" width={100} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '2px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(value) => [`₹${value || 0}Cr`, '']}
                      />
                      <Legend />
                      <Bar dataKey="allocated" name="Allocated" fill="hsl(var(--muted))" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="utilized" name="Utilized" fill="hsl(26.1 100% 34.7%)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-2 border-border/60">
                <CardHeader>
                  <CardTitle className="text-lg font-display flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-primary" />
                    Revenue Sources
                  </CardTitle>
                  <CardDescription>Distribution of income streams</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RePieChart>
                      <Pie
                        data={revenueBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {revenueBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '2px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(value) => [`${value || 0}%`, '']}
                      />
                    </RePieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </Wrapper>

          <Wrapper variants={item}>
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-2 border-border/60">
                <CardHeader>
                  <CardTitle className="text-lg font-display flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-primary" />
                    Expense Breakdown
                  </CardTitle>
                  <CardDescription>{expenseBreakdown.length ? 'Major expenditure categories' : 'No expense ledger data available'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RePieChart>
                      <Pie
                        data={expenseBreakdown}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={true}
                      >
                        {expenseBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '2px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(value) => [`${value || 0}%`, '']}
                      />
                    </RePieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-2 border-border/60">
                <CardHeader>
                  <CardTitle className="text-lg font-display flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Quarterly Cash Flow
                  </CardTitle>
                  <CardDescription>{cashFlowData.length ? 'Inflow vs outflow by quarter' : 'No cash-flow ledger data available'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={cashFlowData} barGap={8}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `₹${v}Cr`} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '2px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(value) => [`₹${value || 0}Cr`, '']}
                      />
                      <Legend />
                      <Bar dataKey="inflow" name="Inflow" fill="hsl(136 40.5% 43.5%)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="outflow" name="Outflow" fill="hsl(1.2 63.4% 48.2%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </Wrapper>

          <Wrapper variants={item}>
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-2 border-border/60 bg-gradient-to-br from-success/20 to-background">
                <CardContent className="p-5">
                  <p className="text-sm font-medium text-muted-foreground">Fee Collection Rate</p>
                  <p className="mt-2 font-display text-2xl font-bold">{feeCollectionRate}%</p>
                  <p className="mt-1 text-xs text-muted-foreground">Based on recorded fee transactions</p>
                </CardContent>
              </Card>
              <Card className="border-2 border-border/60 bg-gradient-to-br from-info/20 to-background">
                <CardContent className="p-5">
                  <p className="text-sm font-medium text-muted-foreground">Outstanding Fees</p>
                  <p className="mt-2 font-display text-2xl font-bold">₹{outstandingFees.toFixed(1)}Cr</p>
                  <p className="mt-1 text-xs text-muted-foreground">Pending or failed transactions</p>
                </CardContent>
              </Card>
              <Card className="border-2 border-border/60 bg-gradient-to-br from-primary/20 to-background">
                <CardContent className="p-5">
                  <p className="text-sm font-medium text-muted-foreground">Research Grant</p>
                  <p className="mt-2 font-display text-2xl font-bold">N/A</p>
                  <p className="mt-1 text-xs text-muted-foreground">Research grant ledger not connected</p>
                </CardContent>
              </Card>
            </div>
          </Wrapper>
        </Wrapper>
      </div>
    </div>
  );
}

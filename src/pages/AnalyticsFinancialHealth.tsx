import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { 
  DollarSign, TrendingUp, TrendingDown, PiggyBank, 
  ArrowLeft, BarChart3, PieChart
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Legend
} from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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

  const revenueData = [
    { month: 'Jan', revenue: 2.8, expenses: 1.9 },
    { month: 'Feb', revenue: 3.2, expenses: 2.1 },
    { month: 'Mar', revenue: 2.5, expenses: 2.3 },
    { month: 'Apr', revenue: 2.1, expenses: 1.8 },
    { month: 'May', revenue: 2.9, expenses: 2.0 },
    { month: 'Jun', revenue: 3.5, expenses: 2.2 },
    { month: 'Jul', revenue: 4.2, expenses: 2.4 },
    { month: 'Aug', revenue: 3.8, expenses: 2.3 },
    { month: 'Sep', revenue: 3.1, expenses: 2.1 },
    { month: 'Oct', revenue: 2.7, expenses: 1.9 },
    { month: 'Nov', revenue: 3.0, expenses: 2.0 },
    { month: 'Dec', revenue: 3.4, expenses: 2.2 },
  ];

  const budgetUtilization = [
    { department: 'Academic', allocated: 8.5, utilized: 7.8 },
    { department: 'Infrastructure', allocated: 4.2, utilized: 3.9 },
    { department: 'Research', allocated: 3.5, utilized: 3.1 },
    { department: 'Administration', allocated: 2.8, utilized: 2.5 },
    { department: 'Student Services', allocated: 2.0, utilized: 1.8 },
  ];

  const expenseBreakdown = [
    { name: 'Faculty Salaries', value: 45 },
    { name: 'Infrastructure', value: 20 },
    { name: 'Research', value: 12 },
    { name: 'Operations', value: 15 },
    { name: 'Other', value: 8 },
  ];

  const revenueBreakdown = [
    { name: 'Tuition Fees', value: 65 },
    { name: 'Government Grant', value: 20 },
    { name: 'Research Funding', value: 10 },
    { name: 'Other', value: 5 },
  ];

  const cashFlowData = [
    { month: 'Q1', inflow: 8.5, outflow: 6.3 },
    { month: 'Q2', inflow: 8.5, outflow: 6.0 },
    { month: 'Q3', inflow: 10.1, outflow: 6.8 },
    { month: 'Q4', inflow: 9.1, outflow: 6.1 },
  ];

  const totalRevenue = revenueData.reduce((sum, d) => sum + d.revenue, 0);
  const totalExpenses = revenueData.reduce((sum, d) => sum + d.expenses, 0);
  const netSurplus = totalRevenue - totalExpenses;
  const surplusPercentage = ((netSurplus / totalRevenue) * 100).toFixed(1);

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
                  subtext="FY 2024-25"
                  icon={DollarSign}
                  color="bg-success"
                  trend={{ value: 8.2, positive: true }}
                />
                <StatCard 
                  label="Total Expenses" 
                  value={`₹${totalExpenses.toFixed(1)}Cr`}
                  subtext="FY 2024-25"
                  icon={TrendingDown}
                  color="bg-info"
                  trend={{ value: 5.1, positive: false }}
                />
                <StatCard 
                  label="Net Surplus" 
                  value={`₹${netSurplus.toFixed(1)}Cr`}
                  subtext={`${surplusPercentage}% margin`}
                  icon={PiggyBank}
                  color="bg-primary"
                  trend={{ value: 12.5, positive: true }}
                />
                <StatCard 
                  label="Budget Utilization" 
                  value="91%"
                  subtext="Across all departments"
                  icon={TrendingUp}
                  color="bg-warning"
                  trend={{ value: 3.2, positive: true }}
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
                  <CardDescription>Allocated vs utilized budget</CardDescription>
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
                  <CardDescription>Major expenditure categories</CardDescription>
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
                  <CardDescription>Inflow vs outflow by quarter</CardDescription>
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
                  <p className="mt-2 font-display text-2xl font-bold">92%</p>
                  <p className="mt-1 text-xs text-muted-foreground">Above 85% target</p>
                </CardContent>
              </Card>
              <Card className="border-2 border-border/60 bg-gradient-to-br from-info/20 to-background">
                <CardContent className="p-5">
                  <p className="text-sm font-medium text-muted-foreground">Outstanding Fees</p>
                  <p className="mt-2 font-display text-2xl font-bold">₹2.8Cr</p>
                  <p className="mt-1 text-xs text-muted-foreground">3.2% of total</p>
                </CardContent>
              </Card>
              <Card className="border-2 border-border/60 bg-gradient-to-br from-primary/20 to-background">
                <CardContent className="p-5">
                  <p className="text-sm font-medium text-muted-foreground">Research Grant</p>
                  <p className="mt-2 font-display text-2xl font-bold">₹4.5Cr</p>
                  <p className="mt-1 text-xs text-muted-foreground">Active projects</p>
                </CardContent>
              </Card>
            </div>
          </Wrapper>
        </Wrapper>
      </div>
    </div>
  );
}

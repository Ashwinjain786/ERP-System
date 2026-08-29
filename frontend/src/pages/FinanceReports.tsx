import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import type { Variants } from 'motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend 
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useFeeStructures, useFeeTransactions, useFeeDefaulters } from '@/features/finance/hooks';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
};

const COLORS = ['hsl(26.1, 100%, 34.7%)', 'hsl(41.5, 100%, 33.1%)', 'hsl(181.3, 100%, 28%)', 'hsl(229.3, 44.5%, 55.5%)', 'hsl(326.6, 37%, 46.7%)'];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border-2 border-border rounded-lg p-3 shadow-lg">
        <p className="font-body text-sm font-semibold">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="font-body text-sm" style={{ color: entry.color }}>
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function FinanceReports() {
  const { data: structures } = useFeeStructures();
  const { data: transactions } = useFeeTransactions();
  const { data: defaulters } = useFeeDefaulters();
  const [timeRange, setTimeRange] = useState('all');
  const shouldReduceMotion = useReducedMotion();

  const totalRevenue = transactions?.filter(t => t.status === 'success').reduce((sum, t) => sum + t.amount, 0) || 0;
  const pendingAmount = transactions?.filter(t => t.status === 'pending').reduce((sum, t) => sum + t.amount, 0) || 0;
  const totalDue = defaulters?.reduce((sum, d) => sum + d.dueAmount, 0) || 0;
  const collectionRate = (totalRevenue / (totalRevenue + totalDue)) * 100 || 0;

  const programRevenue = React.useMemo(() => structures?.map((s, idx) => ({
    name: `${s.program} (${s.quota || 'general'})`,
    revenue: s.totalAmount,
    students: (idx * 7 % 40) + 10,
  })) || [], [structures]);

  const paymentMethodData = transactions ? [
    { name: 'UPI', value: transactions.filter(t => t.paymentMethod === 'UPI').reduce((s, t) => s + t.amount, 0) },
    { name: 'NetBanking', value: transactions.filter(t => t.paymentMethod === 'NetBanking').reduce((s, t) => s + t.amount, 0) },
    { name: 'Card', value: transactions.filter(t => t.paymentMethod?.includes('Card')).reduce((s, t) => s + t.amount, 0) },
    { name: 'Challan', value: transactions.filter(t => t.paymentMethod === 'Challan').reduce((s, t) => s + t.amount, 0) },
  ] : [];

  const monthlyData = [
    { month: 'Jan', collections: 450000, dues: 120000 },
    { month: 'Feb', collections: 380000, dues: 95000 },
    { month: 'Mar', collections: 520000, dues: 150000 },
    { month: 'Apr', collections: 610000, dues: 180000 },
    { month: 'May', collections: 480000, dues: 140000 },
    { month: 'Jun', collections: 550000, dues: 160000 },
  ];

  const statusData = [
    { name: 'Paid', value: totalRevenue, color: 'hsl(136, 40.5%, 43.5%)' },
    { name: 'Pending', value: pendingAmount, color: 'hsl(37.7, 68.6%, 50%)' },
    { name: 'Defaulters', value: totalDue, color: 'hsl(1.2, 63.4%, 48.2%)' },
  ];

  return (
    <div className="p-6 space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold font-display text-foreground">Financial Analytics</h1>
          <p className="text-muted-foreground font-body mt-1">Overview of fee collections and financial performance</p>
        </div>
        <div className="flex gap-2">
          {(['3M', '6M', '1Y', 'all'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
              className="font-body"
            >
              {range === 'all' ? 'All Time' : range}
            </Button>
          ))}
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: shouldReduceMotion ? 0 : 0.1 }}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <Card>
          <CardContent className="pt-6">
            <Label className="text-muted-foreground font-body">Total Collections</Label>
            <p className="text-2xl font-bold font-display text-success">{formatCurrency(totalRevenue)}</p>
            <p className="text-xs text-muted-foreground font-body mt-1">Successful payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Label className="text-muted-foreground font-body">Pending Amount</Label>
            <p className="text-2xl font-bold font-display text-warning">{formatCurrency(pendingAmount)}</p>
            <p className="text-xs text-muted-foreground font-body mt-1">Awaiting confirmation</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Label className="text-muted-foreground font-body">Defaulters Due</Label>
            <p className="text-2xl font-bold font-display text-destructive">{formatCurrency(totalDue)}</p>
            <p className="text-xs text-muted-foreground font-body mt-1">Overdue payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Label className="text-muted-foreground font-body">Collection Rate</Label>
            <p className="text-2xl font-bold font-display text-info">{collectionRate.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground font-body mt-1">Overall collection efficiency</p>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: shouldReduceMotion ? 0 : 0.15 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg font-display">Monthly Collections vs Dues</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(20, 20.7%, 88.6%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fontFamily: 'Rubik' }} stroke="hsl(20, 5.5%, 32.4%)" />
                  <YAxis tick={{ fontSize: 12, fontFamily: 'Rubik' }} stroke="hsl(20, 5.5%, 32.4%)" tickFormatter={(v) => `${(v/1000)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontFamily: 'Rubik', fontSize: 12 }} />
                  <Line type="monotone" dataKey="collections" stroke="hsl(136, 40.5%, 43.5%)" strokeWidth={2} dot={{ r: 4 }} name="Collections" />
                  <Line type="monotone" dataKey="dues" stroke="hsl(1.2, 63.4%, 48.2%)" strokeWidth={2} dot={{ r: 4 }} name="Dues" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: shouldReduceMotion ? 0 : 0.2 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg font-display">Fee Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    labelLine={{ stroke: 'hsl(20, 5.5%, 32.4%)' }}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: shouldReduceMotion ? 0 : 0.25 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg font-display">Revenue by Program</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={programRevenue} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(20, 20.7%, 88.6%)" />
                  <XAxis type="number" tick={{ fontSize: 12, fontFamily: 'Rubik' }} stroke="hsl(20, 5.5%, 32.4%)" tickFormatter={(v) => `${(v/1000)}k`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fontFamily: 'Rubik' }} stroke="hsl(20, 5.5%, 32.4%)" width={120} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="revenue" fill="hsl(26.1, 100%, 34.7%)" radius={[0, 4, 4, 0]} name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: shouldReduceMotion ? 0 : 0.3 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg font-display">Payment Methods</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={paymentMethodData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(20, 20.7%, 88.6%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fontFamily: 'Rubik' }} stroke="hsl(20, 5.5%, 32.4%)" />
                  <YAxis tick={{ fontSize: 12, fontFamily: 'Rubik' }} stroke="hsl(20, 5.5%, 32.4%)" tickFormatter={(v) => `${(v/1000)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="hsl(41.5, 100%, 33.1%)" radius={[4, 4, 0, 0]} name="Amount" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

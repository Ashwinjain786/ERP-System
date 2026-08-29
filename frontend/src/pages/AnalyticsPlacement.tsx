import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { 
  TrendingUp, Briefcase, Award, DollarSign, 
  ArrowLeft, BarChart3, Users, Target
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePlacementAnalytics } from '@/features/analytics/hooks';
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

function StatCard({ label, value, subtext, icon: Icon, color }: {
  label: string;
  value: string | number;
  subtext?: string;
  icon: React.ElementType;
  color: string;
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
        <div className="mt-4">
          <span className="font-display text-3xl font-bold tracking-tight tabular-nums">{value}</span>
        </div>
        {subtext && <p className="mt-1.5 text-xs text-muted-foreground">{subtext}</p>}
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPlacement() {
  const reduceMotion = useReducedMotion();
  const Wrapper = reduceMotion ? 'div' : motion.div;
  const { data: placement, isLoading } = usePlacementAnalytics();

  /* const ctcDistribution = [
    { range: '3-5 LPA', students: 85, color: 'hsl(37.7 68.6% 50%)' },
    { range: '5-8 LPA', students: 145, color: 'hsl(41.5 100% 33.1%)' },
    { range: '8-12 LPA', students: 98, color: 'hsl(26.1 100% 34.7%)' },
    { range: '12-18 LPA', students: 42, color: 'hsl(181.3 100% 28%)' },
    { range: '>18 LPA', students: 10, color: 'hsl(136 40.5% 43.5%)' },
  ]; */

  /* const companyTypeData = [
    { type: 'IT Services', count: 45 },
    { type: 'Product', count: 32 },
    { type: 'Consulting', count: 18 },
    { type: 'Finance', count: 15 },
    { type: 'Core Engineering', count: 12 },
  ]; */

  /* const placementTrend = [
    { year: '2020', placed: 280, total: 400 },
    { year: '2021', placed: 310, total: 420 },
    { year: '2022', placed: 295, total: 410 },
    { year: '2023', placed: 340, total: 450 },
    { year: '2024', placed: 380, total: 480 },
  ]; */

  /* const recruiters = [
    { name: 'Google', offers: 12, avgCtc: 18.5, logo: '🔍' },
    { name: 'Microsoft', offers: 15, avgCtc: 16.2, logo: '🪟' },
    { name: 'Amazon', offers: 22, avgCtc: 14.8, logo: '📦' },
    { name: 'Meta', offers: 8, avgCtc: 15.5, logo: '📘' },
    { name: 'Adobe', offers: 10, avgCtc: 13.2, logo: '🎨' },
    { name: 'Goldman Sachs', offers: 6, avgCtc: 12.8, logo: '🏦' },
  ]; */

  const ctcDistribution = placement?.ctcDistribution || [];
  const companyTypeData = placement?.companyTypeDistribution || [];
  const placementTrend = placement?.placementTrend || [];
  const recruiters = placement?.topRecruiters || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

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
                    Placement Analytics
                  </h1>
                  <p className="mt-1 text-muted-foreground">
                    Recruitment statistics, top recruiters, and CTC insights
                  </p>
                </div>
              </div>
            </Wrapper>

            <Wrapper variants={item}>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard 
                  label="Placement Rate" 
                  value={`${placement?.placementPercentage || 0}%`}
                  subtext="Students placed vs eligible"
                  icon={Target}
                  color="bg-emerald-500"
                />
                <StatCard 
                  label="Total Offers" 
                  value={placement?.totalOffers || 0}
                  subtext="Across all companies"
                  icon={Briefcase}
                  color="bg-blue-500"
                />
                <StatCard 
                  label="Average CTC" 
                  value={`₹${((placement?.averageCTC || 0) / 100000).toFixed(1)}L`}
                  subtext="Cost to company"
                  icon={DollarSign}
                  color="bg-violet-500"
                />
                <StatCard 
                  label="Highest CTC" 
                  value={`₹${((placement?.highestCTC || 0) / 100000).toFixed(1)}L`}
                  subtext="Top package offered"
                  icon={Award}
                  color="bg-amber-500"
                />
              </div>
            </Wrapper>
          </Wrapper>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 space-y-8">
        <Wrapper variants={container} initial="hidden" animate="show" className="space-y-8">
          <Wrapper variants={item}>
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-2 border-border/60">
                <CardHeader>
                  <CardTitle className="text-lg font-display flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    CTC Distribution
                  </CardTitle>
                  <CardDescription>Students by salary range</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={ctcDistribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="range" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '2px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="students" name="Students" radius={[4, 4, 0, 0]}>
                        {ctcDistribution.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-2 border-border/60">
                <CardHeader>
                  <CardTitle className="text-lg font-display flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Placement Trend
                  </CardTitle>
                  <CardDescription>Year-over-year placement stats</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={placementTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '2px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="placed" 
                        stroke="hsl(26.1 100% 34.7%)" 
                        fill="hsl(26.1 100% 34.7% / 0.2)" 
                        strokeWidth={2}
                        name="Placed"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="offers"
                        stroke="hsl(var(--muted-foreground))" 
                        fill="hsl(var(--muted) / 0.2)" 
                        strokeWidth={2}
                        name="Offers"
                      />
                    </AreaChart>
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
                    <Users className="w-5 h-5 text-primary" />
                    Top Recruiters
                  </CardTitle>
                  <CardDescription>Companies with most offers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recruiters.map((company, index) => (
                      <div key={company.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🏢</span>
                          <div>
                            <p className="font-medium">{company.name}</p>
                            <p className="text-sm text-muted-foreground">{company.offers} offers</p>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-primary">₹{company.averageCTC.toFixed(1)}L</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-border/60">
                <CardHeader>
                  <CardTitle className="text-lg font-display flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-primary" />
                    Company Categories
                  </CardTitle>
                  <CardDescription>Distribution by industry type</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RePieChart>
                      <Pie
                        data={companyTypeData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="count"
                        label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={true}
                      >
                        {companyTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '2px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                    </RePieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </Wrapper>

          <Wrapper variants={item}>
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-2 border-border/60 bg-gradient-to-br from-emerald-50 to-background">
                <CardContent className="p-5">
                  <p className="text-sm font-medium text-muted-foreground">Median Package</p>
                  <p className="mt-2 font-display text-2xl font-bold">₹6.2L</p>
                  <p className="mt-1 text-xs text-muted-foreground">+12% vs last year</p>
                </CardContent>
              </Card>
              <Card className="border-2 border-border/60 bg-gradient-to-br from-blue-50 to-background">
                <CardContent className="p-5">
                  <p className="text-sm font-medium text-muted-foreground">Dream Offers</p>
                  <p className="mt-2 font-display text-2xl font-bold">156</p>
                  <p className="mt-1 text-xs text-muted-foreground">Above 10 LPA</p>
                </CardContent>
              </Card>
              <Card className="border-2 border-border/60 bg-gradient-to-br from-violet-50 to-background">
                <CardContent className="p-5">
                  <p className="text-sm font-medium text-muted-foreground">Super Dream</p>
                  <p className="mt-2 font-display text-2xl font-bold">52</p>
                  <p className="mt-1 text-xs text-muted-foreground">Above 15 LPA</p>
                </CardContent>
              </Card>
            </div>
          </Wrapper>
        </Wrapper>
      </div>
    </div>
  );
}

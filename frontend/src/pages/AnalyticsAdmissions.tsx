import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { 
  Users, UserCheck, TrendingUp, GraduationCap, 
  ArrowLeft, PieChart, BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart as RePieChart, Pie, Cell, FunnelChart, Funnel, LabelList 
} from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAdmissionsAnalytics } from '@/features/analytics/hooks';
import { cn } from '@/lib/utils';

const COLORS = ['hsl(26.1 100% 34.7%)', 'hsl(41.5 100% 33.1%)', 'hsl(181.3 100% 28%)', 'hsl(229.3 44.5% 55.5%)'];

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

export default function AnalyticsAdmissions() {
  const reduceMotion = useReducedMotion();
  const Wrapper = reduceMotion ? 'div' : motion.div;
  const { data: admissions, isLoading } = useAdmissionsAnalytics();

  const funnelData = [
    { name: 'Applications', value: admissions?.totalApplications || 0, fill: COLORS[0] },
    { name: 'Screened', value: Math.round((admissions?.totalApplications || 0) * 0.75), fill: COLORS[1] },
    { name: 'Interviewed', value: Math.round((admissions?.totalApplications || 0) * 0.45), fill: COLORS[2] },
    { name: 'Admitted', value: admissions?.admittedStudents || 0, fill: COLORS[3] },
  ];

  const genderData = [
    { name: 'Male', value: admissions?.genderRatio?.male || 58 },
    { name: 'Female', value: admissions?.genderRatio?.female || 42 },
  ];

  const programData = [
    { program: 'B.Tech', applications: 1200, admitted: 220 },
    { program: 'M.Tech', applications: 450, admitted: 85 },
    { program: 'B.Sc', applications: 380, admitted: 65 },
    { program: 'M.Sc', applications: 280, admitted: 45 },
    { program: 'MBA', applications: 190, admitted: 35 },
  ];

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
                    Admissions Analytics
                  </h1>
                  <p className="mt-1 text-muted-foreground">
                    Enrollment funnel and demographic insights
                  </p>
                </div>
              </div>
            </Wrapper>

            <Wrapper variants={item}>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard 
                  label="Total Applications" 
                  value={(admissions?.totalApplications || 0).toLocaleString()}
                  subtext="This academic year"
                  icon={Users}
                  color="bg-emerald-500"
                />
                <StatCard 
                  label="Admitted Students" 
                  value={admissions?.admittedStudents || 0}
                  subtext="Enrollment target: 500"
                  icon={UserCheck}
                  color="bg-blue-500"
                />
                <StatCard 
                  label="Acceptance Rate" 
                  value={`${admissions?.acceptanceRate || 0}%`}
                  subtext="Competitive admissions"
                  icon={TrendingUp}
                  color="bg-violet-500"
                />
                <StatCard 
                  label="Yield Rate" 
                  value={`${Math.round(((admissions?.admittedStudents || 0) / (admissions?.totalApplications || 1)) * 100)}%`}
                  subtext="Admitted vs enrolled"
                  icon={GraduationCap}
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
                    Admissions Funnel
                  </CardTitle>
                  <CardDescription>Application to enrollment conversion</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <FunnelChart>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '2px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Funnel dataKey="value" data={funnelData} isAnimationActive={!reduceMotion}>
                        <LabelList position="right" fill="hsl(var(--foreground))" stroke="none" dataKey="name" />
                      </Funnel>
                    </FunnelChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-2 border-border/60">
                <CardHeader>
                  <CardTitle className="text-lg font-display flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-primary" />
                    Gender Distribution
                  </CardTitle>
                  <CardDescription>Admitted students demographics</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RePieChart>
                      <Pie
                        data={genderData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                        labelLine={false}
                      >
                        {genderData.map((entry, index) => (
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
            <Card className="border-2 border-border/60">
              <CardHeader>
                <CardTitle className="text-lg font-display flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Applications by Program
                </CardTitle>
                <CardDescription>Admission metrics across different programs</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={programData} barGap={8}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="program" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '2px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="applications" name="Applications" fill="hsl(26.1 100% 34.7%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="admitted" name="Admitted" fill="hsl(41.5 100% 33.1%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Wrapper>

          <Wrapper variants={item}>
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-2 border-border/60 bg-gradient-to-br from-emerald-50 to-background">
                <CardContent className="p-5">
                  <p className="text-sm font-medium text-muted-foreground">Top Source College</p>
                  <p className="mt-2 font-display text-2xl font-bold">Delhi Public School</p>
                  <p className="mt-1 text-xs text-muted-foreground">85 admitted students</p>
                </CardContent>
              </Card>
              <Card className="border-2 border-border/60 bg-gradient-to-br from-blue-50 to-background">
                <CardContent className="p-5">
                  <p className="text-sm font-medium text-muted-foreground">Average Entrance Score</p>
                  <p className="mt-2 font-display text-2xl font-bold">142/200</p>
                  <p className="mt-1 text-xs text-muted-foreground">+8% vs last year</p>
                </CardContent>
              </Card>
              <Card className="border-2 border-border/60 bg-gradient-to-br from-violet-50 to-background">
                <CardContent className="p-5">
                  <p className="text-sm font-medium text-muted-foreground">International Students</p>
                  <p className="mt-2 font-display text-2xl font-bold">23</p>
                  <p className="mt-1 text-xs text-muted-foreground">From 8 countries</p>
                </CardContent>
              </Card>
            </div>
          </Wrapper>
        </Wrapper>
      </div>
    </div>
  );
}

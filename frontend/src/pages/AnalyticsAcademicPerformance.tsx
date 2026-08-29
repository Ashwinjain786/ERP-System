import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { 
  GraduationCap, TrendingUp, AlertTriangle, BookOpen,
  ArrowLeft, BarChart3, Users
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area 
} from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAcademicPerformanceAnalytics } from '@/features/analytics/hooks';
import { cn } from '@/lib/utils';

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

export default function AnalyticsAcademicPerformance() {
  const reduceMotion = useReducedMotion();
  const Wrapper = reduceMotion ? 'div' : motion.div;
  const { data: academic, isLoading } = useAcademicPerformanceAnalytics();

  const cgpaDistribution = academic?.cgpaDistribution || [];
  const backlogData = academic?.backlogBySemester || [];
  const deptData = academic?.departmentPassRates || [];
  const toppers = academic?.toppers || [];
  const distinctionCount = cgpaDistribution.find((bucket) => bucket.range === '9-10')?.students || 0;

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
                    Academic Performance
                  </h1>
                  <p className="mt-1 text-muted-foreground">
                    Department pass rates, CGPA distribution, and backlog analysis
                  </p>
                </div>
              </div>
            </Wrapper>

            <Wrapper variants={item}>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard 
                  label="Overall Pass Rate" 
                  value={`${academic?.overallPassPercentage || 0}%`}
                  subtext="All departments combined"
                  icon={GraduationCap}
                  color="bg-emerald-500"
                />
                <StatCard 
                  label="Median CGPA" 
                  value={academic?.medianCGPA || 0}
                  subtext="Student performance benchmark"
                  icon={TrendingUp}
                  color="bg-blue-500"
                />
                <StatCard 
                  label="Backlog Rate" 
                  value={`${academic?.backlogRate || 0}%`}
                  subtext="Students with active backlogs"
                  icon={AlertTriangle}
                  color="bg-amber-500"
                />
                <StatCard 
                  label="Distinction" 
                  value={distinctionCount}
                  subtext="CGPA 9.0 and above"
                  icon={BookOpen}
                  color="bg-violet-500"
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
                    Department Pass Rates
                  </CardTitle>
                  <CardDescription>Pass percentage by department</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={deptData} layout="vertical" barGap={8}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={true} vertical={false} />
                      <XAxis type="number" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis dataKey="department" type="category" width={120} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '2px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(value) => [`${value || 0}%`, 'Pass Rate']}
                      />
                      <Bar dataKey="passRate" fill="hsl(26.1 100% 34.7%)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-2 border-border/60">
                <CardHeader>
                  <CardTitle className="text-lg font-display flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    CGPA Distribution
                  </CardTitle>
                  <CardDescription>Student count by CGPA range</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={cgpaDistribution}>
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
                        {cgpaDistribution.map((entry, index) => (
                          <Bar key={`cell-${index}`} fill="hsl(26.1 100% 34.7%)" dataKey="students" />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </Wrapper>

          <Wrapper variants={item}>
            <Card className="border-2 border-border/60">
              <CardHeader>
                <CardTitle className="text-lg font-display flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-primary" />
                  Backlog Analysis by Semester
                </CardTitle>
                <CardDescription>Trend of backlogs across semesters</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={backlogData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="semester" stroke="hsl(var(--muted-foreground))" fontSize={12} />
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
                      dataKey="backlogs" 
                      stroke="hsl(1.2 63.4% 48.2%)" 
                      fill="hsl(1.2 63.4% 48.2% / 0.2)" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Wrapper>

          <Wrapper variants={item}>
            <Card className="border-2 border-border/60">
              <CardHeader>
                <CardTitle className="text-lg font-display flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Top Performers
                </CardTitle>
                <CardDescription>Highest CGPA students this semester</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {toppers.map((student, index) => (
                    <div key={student.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                          index === 0 ? "bg-amber-400 text-amber-950" :
                          index === 1 ? "bg-slate-300 text-slate-700" :
                          index === 2 ? "bg-orange-300 text-orange-800" :
                          "bg-muted text-muted-foreground"
                        )}>
                          #{index + 1}
                        </span>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground">{student.department}</p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-lg text-primary">{student.cgpa}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Wrapper>
        </Wrapper>
      </div>
    </div>
  );
}

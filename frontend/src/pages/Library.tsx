import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, ArrowRight, BookMarked, AlertTriangle, Users, FileText
} from 'lucide-react';
import { format } from 'date-fns';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLibraryBooks, useCirculationRecords, useLibraryFines } from '@/features/library/hooks';
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

export default function Library() {
  const reduceMotion = useReducedMotion();
  const Wrapper = reduceMotion ? 'div' : motion.div;
  const { data: books } = useLibraryBooks();
  const { data: circulation } = useCirculationRecords();
  const { data: fines } = useLibraryFines();

  const totalBooks = books?.reduce((acc, b) => acc + (b.totalCopies || 0), 0) || 0;
  const availableBooks = books?.reduce((acc, b) => acc + b.availableCopies, 0) || 0;
  const issuedBooks = circulation?.filter(c => c.status === 'issued' || c.status === 'overdue').length || 0;
  const overdueBooks = circulation?.filter(c => c.status === 'overdue').length || 0;
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b-2 border-border/60 bg-gradient-to-r from-primary/5 via-background to-background">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
          <Wrapper variants={container} initial="hidden" animate="show" className="space-y-6">
            <Wrapper variants={item}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="font-display text-3xl font-bold tracking-tight">
                    Library System
                  </h1>
                  <p className="mt-1 text-muted-foreground">
                    Central library management and circulation
                  </p>
                </div>
              </div>
            </Wrapper>

            <Wrapper variants={item}>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard 
                  label="Total Books" 
                  value={totalBooks}
                  subtext="Across all categories"
                  icon={BookOpen}
                  color="bg-emerald-500"
                />
                <StatCard 
                  label="Available" 
                  value={availableBooks}
                  subtext="Books ready to issue"
                  icon={BookMarked}
                  color="bg-blue-500"
                />
                <StatCard 
                  label="Currently Issued" 
                  value={issuedBooks}
                  subtext="Books currently on loan"
                  icon={Users}
                  color="bg-violet-500"
                />
                <StatCard 
                  label="Overdue" 
                  value={overdueBooks}
                  subtext="Requires attention"
                  icon={AlertTriangle}
                  color="bg-destructive"
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
                <CardTitle className="text-lg font-display">Recent Circulation</CardTitle>
                <CardDescription>Latest book issues and returns</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/library/circulation">View All <ArrowRight className="ml-1 w-4 h-4" /></Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {circulation?.slice(0, 5).map((record) => (
                  <div key={record.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                    <div className={cn(
                      "p-2 rounded-lg",
                      record.status === 'issued' ? 'bg-info/10' : record.status === 'overdue' ? 'bg-destructive/10' : 'bg-success/10'
                    )}>
                      <BookMarked className={cn(
                        "w-5 h-5",
                        record.status === 'issued' ? 'text-info' : record.status === 'overdue' ? 'text-destructive' : 'text-success'
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground">{record.bookTitle}</p>
                      <p className="text-sm text-muted-foreground">{record.borrowerName}</p>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        "text-xs font-medium",
                        record.status === 'issued' ? 'text-info' : record.status === 'overdue' ? 'text-destructive' : 'text-success'
                      )}>{record.status}</p>
                      <p className="text-xs text-muted-foreground">Due: {format(new Date(record.dueDate), 'MMM d')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-border/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg font-display">Pending Fines</CardTitle>
                <CardDescription>Unpaid library fines</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/library/fines">View All <ArrowRight className="ml-1 w-4 h-4" /></Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {fines?.filter(f => f.status === 'unpaid').slice(0, 5).map((fine) => (
                  <div key={fine.id} className="flex items-center gap-4 p-3 rounded-lg bg-destructive/5 border-l-4 border-destructive">
                    <div className="p-2 rounded-lg bg-destructive/10">
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground">{fine.userName}</p>
                      <p className="text-sm text-muted-foreground">{fine.reason}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-semibold text-destructive tabular-nums">₹{fine.amount}</p>
                    </div>
                  </div>
                ))}
                {(!fines || fines.filter(f => f.status === 'unpaid').length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No pending fines</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3">
          <h2 className="font-display text-xl font-semibold tracking-tight">Quick Actions</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link 
              to="/library/catalog"
              className="group flex items-center gap-4 p-4 rounded-xl border-2 border-border/60 bg-card hover:border-primary/40 hover:shadow-md transition-all duration-200"
            >
              <div className="p-3 rounded-xl bg-emerald-500">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground">Catalog</p>
                <p className="text-sm text-muted-foreground">Search books</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </Link>
            <Link 
              to="/library/circulation"
              className="group flex items-center gap-4 p-4 rounded-xl border-2 border-border/60 bg-card hover:border-primary/40 hover:shadow-md transition-all duration-200"
            >
              <div className="p-3 rounded-xl bg-blue-500">
                <BookMarked className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground">Circulation</p>
                <p className="text-sm text-muted-foreground">Issue & return</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </Link>
            <Link 
              to="/library/fines"
              className="group flex items-center gap-4 p-4 rounded-xl border-2 border-border/60 bg-card hover:border-primary/40 hover:shadow-md transition-all duration-200"
            >
              <div className="p-3 rounded-xl bg-amber-500">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground">Fines</p>
                <p className="text-sm text-muted-foreground">Manage fines</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

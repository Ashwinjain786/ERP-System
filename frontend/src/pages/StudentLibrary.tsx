import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Library, BookOpen, Calendar, AlertTriangle, CheckCircle, Clock, Search } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useStudentLibrary } from '@/features/student/hooks';
import { cn } from '@/lib/utils';
import type { CirculationRecord } from '@/api/apiInterface';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
} as const;

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

function BookCard({ record }: { record: CirculationRecord }) {
  const isIssued = record.status === 'issued';
  const isReturned = record.status === 'returned';
  const isOverdue = record.status === 'overdue';
  
  const dueDate = new Date(record.dueDate);
  const daysLeft = differenceInDays(dueDate, new Date());
  const isDueSoon = daysLeft <= 5 && daysLeft > 0;
  const isOverdueStatus = daysLeft < 0;

  return (
    <motion.div variants={item} className="p-4 rounded-xl border-2 border-border/60 bg-card hover:border-primary/20 transition-all">
      <div className="flex items-start gap-4">
        <div className={cn(
          "p-3 rounded-xl",
          isOverdue || isOverdueStatus ? 'bg-destructive/10' : isIssued ? 'bg-primary/10' : 'bg-muted'
        )}>
          <BookOpen className={cn(
            "w-5 h-5",
            isOverdue || isOverdueStatus ? 'text-destructive' : isIssued ? 'text-primary' : 'text-muted-foreground'
          )} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground">{record.bookTitle}</h3>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Issued: {format(new Date(record.issueDate), 'MMM d, yyyy')}
            </span>
          </div>
          <div className="flex items-center gap-4 mt-1 text-sm">
            {isIssued && (
              <span className={cn(
                "flex items-center gap-1",
                isOverdueStatus ? 'text-destructive font-medium' : isDueSoon ? 'text-warning font-medium' : 'text-muted-foreground'
              )}>
                <Clock className="w-4 h-4" />
                {isOverdueStatus 
                  ? `${Math.abs(daysLeft)} days overdue` 
                  : daysLeft === 0 
                    ? 'Due today'
                    : `Due in ${daysLeft} days`
                }
              </span>
            )}
            {isReturned && (
              <span className="flex items-center gap-1 text-success">
                <CheckCircle className="w-4 h-4" />
                Returned: {format(new Date(record.returnDate!), 'MMM d, yyyy')}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={cn(
            "px-2.5 py-1 rounded-full text-xs font-semibold",
            isOverdue || isOverdueStatus ? 'bg-destructive/10 text-destructive' :
            isIssued ? 'bg-primary/10 text-primary' :
            'bg-success/10 text-success'
          )}>
            {isOverdueStatus ? 'Overdue' : isIssued ? 'Issued' : 'Returned'}
          </span>
          {record.fineAmount && record.fineAmount > 0 && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-warning/10 text-warning">
              Fine: ₹{record.fineAmount}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function LibrarySkeleton() {
  return (
    <div className="p-4 rounded-xl border-2 border-border/60 bg-card animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-muted" />
        <div className="flex-1">
          <div className="h-5 w-48 bg-muted rounded" />
          <div className="h-4 w-32 bg-muted rounded mt-2" />
        </div>
      </div>
    </div>
  );
}

export default function StudentLibrary() {
  const reduceMotion = useReducedMotion();
  const Wrapper = reduceMotion ? 'div' : motion.div;
  const { data: books, isLoading, error } = useStudentLibrary();
  const [searchTerm, setSearchTerm] = React.useState('');

  const borrowedBooks = books?.filter((b: CirculationRecord) => b.status === 'issued') || [];
  const returnedBooks = books?.filter((b: CirculationRecord) => b.status === 'returned') || [];
  const overdueBooks = books?.filter((b: CirculationRecord) => {
    if (b.status !== 'issued') return false;
    return differenceInDays(new Date(b.dueDate), new Date()) < 0;
  }) || [];

  const filteredBooks = books?.filter((book: CirculationRecord) => 
    book.bookTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b-2 border-border/60 bg-gradient-to-r from-primary/5 via-background to-background">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
          <Wrapper variants={container} initial="hidden" animate="show">
            <Wrapper variants={item}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="font-display text-3xl font-bold tracking-tight">Library</h1>
                  <p className="mt-1 text-muted-foreground">
                    Manage your borrowed books and library activities
                  </p>
                </div>
              </div>
            </Wrapper>

            <Wrapper variants={item}>
              <div className="grid gap-4 md:grid-cols-3 mt-6">
                <Card className="border-2 border-border/60 bg-card">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Currently Borrowed</span>
                      <div className="font-display text-2xl font-bold tracking-tight tabular-nums">
                        {isLoading ? '-' : borrowedBooks.length}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-2 border-border/60 bg-card">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-destructive/10">
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Overdue Books</span>
                      <div className="font-display text-2xl font-bold tracking-tight tabular-nums text-destructive">
                        {isLoading ? '-' : overdueBooks.length}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-2 border-border/60 bg-card">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-success/10">
                      <CheckCircle className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Returned</span>
                      <div className="font-display text-2xl font-bold tracking-tight tabular-nums">
                        {isLoading ? '-' : returnedBooks.length}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </Wrapper>
          </Wrapper>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <Card className="border-2 border-border/60">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-display">Borrowed Books</CardTitle>
                <CardDescription>Track your current library borrowings</CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search books..." 
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-center py-8">
                <p className="text-destructive font-medium">Failed to load library data. Please try again.</p>
              </div>
            ) : isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => <LibrarySkeleton key={i} />)}
              </div>
            ) : filteredBooks.length === 0 ? (
              <div className="text-center py-12">
                <Library className="w-16 h-16 mx-auto text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">No Books Found</h3>
                <p className="mt-2 text-muted-foreground">
                  {searchTerm ? 'No books match your search.' : "You haven't borrowed any books."}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredBooks.map((book: CirculationRecord) => (
                  <BookCard key={book.id} record={book} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

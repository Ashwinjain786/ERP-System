import React, { useState, useMemo } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'motion/react';
import { ScanBarcode, BookMarked, ArrowRightLeft, Calendar, User, BookOpen, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCirculationRecords, useIssueLibraryBook, useLibraryBooks, useReturnLibraryBook } from '@/features/library/hooks';
import { cn } from '@/lib/utils';
import type { Book, CirculationRecord } from '@/api/apiInterface';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

export default function LibraryCirculation() {
  const reduceMotion = useReducedMotion();
  const Wrapper = reduceMotion ? 'div' : motion.div;
  const { data: circulation, isLoading: isLoadingCirculation } = useCirculationRecords();
  const { data: books } = useLibraryBooks();
  const issueBook = useIssueLibraryBook();
  const returnBook = useReturnLibraryBook();
  
  const [barcodeInput, setBarcodeInput] = useState('');
  const [borrowerInput, setBorrowerInput] = useState('');
  const [durationDays, setDurationDays] = useState('14');
  const [actionError, setActionError] = useState('');
  const [activeTab, setActiveTab] = useState<'issue' | 'return'>('issue');
  const [scannedItem, setScannedItem] = useState<{type: 'book' | 'card'; data: Book | CirculationRecord | { id: string; name: string }} | null>(null);

  const handleScan = () => {
    if (!barcodeInput.trim()) return;
    setActionError('');

    const book = books?.find(b => b.isbn === barcodeInput || b.id === barcodeInput);
    const record = circulation?.find(c =>
      c.id === barcodeInput || c.bookId === barcodeInput || (book && c.bookId === book.id)
    );

    // Returning must resolve an existing circulation record before resolving the book.
    if (activeTab === 'return' && record) {
      setScannedItem({ type: 'book', data: { ...record, title: record.bookTitle } });
      return;
    }
    if (book) {
      setScannedItem({ type: 'book', data: book });
      return;
    }
    if (record) {
      setScannedItem({ type: 'book', data: { ...record, title: record.bookTitle } });
      return;
    }
    
    setScannedItem(null);
    setActionError('No matching book or circulation record was found.');
  };

  const handleIssue = async () => {
    setActionError('');
    if (!scannedItem || scannedItem.type !== 'book' || !('isbn' in scannedItem.data)) {
      setActionError('Scan a book ISBN or book ID first.');
      return;
    }
    if (!borrowerInput.trim()) {
      setActionError('Enter the borrower user ID or scan their ID.');
      return;
    }
    try {
      await issueBook.mutateAsync({
        bookId: scannedItem.data.id,
        borrowerId: borrowerInput.trim(),
        durationDays: Number(durationDays) || 14,
      });
      setScannedItem(null);
      setBarcodeInput('');
      setBorrowerInput('');
    } catch (error) {
      setActionError((error as Error).message);
    }
  };

  const handleReturn = async (recordOverride?: CirculationRecord) => {
    setActionError('');
    const record = recordOverride || (scannedItem?.type === 'book' && 'bookId' in scannedItem.data ? scannedItem.data as CirculationRecord : undefined);
    if (!record || !('id' in record)) {
      setActionError('Scan an active circulation record, book ID, or circulation ID first.');
      return;
    }
    try {
      await returnBook.mutateAsync({ circulationId: record.id });
      setScannedItem(null);
      setBarcodeInput('');
    } catch (error) {
      setActionError((error as Error).message);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'issued':
        return <span className="inline-flex items-center gap-1 text-xs font-medium text-info"><Clock className="w-3 h-3" /> Issued</span>;
      case 'overdue':
        return <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive"><AlertTriangle className="w-3 h-3" /> Overdue</span>;
      case 'returned':
        return <span className="inline-flex items-center gap-1 text-xs font-medium text-success"><CheckCircle className="w-3 h-3" /> Returned</span>;
      default:
        return null;
    }
  };

  const filteredRecords = useMemo(() => {
    if (!circulation) return [];
    return circulation.filter(r => activeTab === 'issue' ? r.status === 'issued' || r.status === 'overdue' : r.status === 'returned');
  }, [circulation, activeTab]);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b-2 border-border/60 bg-gradient-to-r from-primary/5 via-background to-background">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
          <Wrapper initial="hidden" animate="show" className="space-y-6">
            <Wrapper variants={item}>
              <div>
                <h1 className="font-display text-3xl font-bold tracking-tight">Circulation Desk</h1>
                <p className="mt-1 text-muted-foreground">
                  Issue and return books using barcode scanner
                </p>
              </div>
            </Wrapper>

            <Wrapper variants={item}>
              <Card className="border-2 border-primary/30 bg-primary/5">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                      <label className="text-sm font-medium mb-2 block">Scan Barcode / Enter ID</label>
                      <div className="relative">
                        <ScanBarcode className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          placeholder="Scan book barcode or enter ID..."
                          value={barcodeInput}
                          onChange={(e) => setBarcodeInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                          className="pl-11 h-12 text-lg"
                        />
                      </div>
                    </div>
                    {activeTab === 'issue' && (
                      <div className="w-full md:w-64">
                        <label className="text-sm font-medium mb-2 block">Borrower User ID</label>
                        <Input value={borrowerInput} onChange={(e) => setBorrowerInput(e.target.value)} placeholder="User ID" className="h-12" />
                      </div>
                    )}
                    {activeTab === 'issue' && (
                      <div className="w-full md:w-32">
                        <label className="text-sm font-medium mb-2 block">Days</label>
                        <Input type="number" min="1" value={durationDays} onChange={(e) => setDurationDays(e.target.value)} className="h-12" />
                      </div>
                    )}
                    <div className="flex gap-2 w-full md:w-auto">
                      <Button size="lg" onClick={() => { setActiveTab('issue'); handleScan(); }} className="flex-1 md:flex-none">
                        <BookMarked className="w-5 h-5 mr-2" />
                        Issue
                      </Button>
                      <Button size="lg" variant="outline" onClick={() => { setActiveTab('return'); handleScan(); }} className="flex-1 md:flex-none">
                        <ArrowRightLeft className="w-5 h-5 mr-2" />
                        Return
                      </Button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {scannedItem && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 p-4 rounded-xl bg-card border-2 border-border"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-success/10">
                              <CheckCircle className="w-5 h-5 text-success" />
                            </div>
                            <div>
                              <p className="font-semibold">
                                {scannedItem.type === 'book' ? ('bookTitle' in scannedItem.data ? scannedItem.data.bookTitle : (scannedItem.data as Book).title) : (scannedItem.data as { name: string }).name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {scannedItem.type === 'book' ? ('isbn' in scannedItem.data ? `ISBN: ${(scannedItem.data as Book).isbn}` : '') : (scannedItem.data as { id: string }).id}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {scannedItem.type === 'book' && 'isbn' in scannedItem.data && (
                              <Button size="sm" onClick={handleIssue} disabled={issueBook.isPending}>
                                {issueBook.isPending ? 'Issuing...' : 'Issue Book'}
                              </Button>
                            )}
                            {scannedItem.type === 'book' && 'bookId' in scannedItem.data && (
                              <Button size="sm" onClick={() => handleReturn()} disabled={returnBook.isPending}>
                                {returnBook.isPending ? 'Returning...' : 'Return Book'}
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" onClick={() => setScannedItem(null)}>Clear</Button>
                          </div>
                        </div>
                        {actionError && <p className="mt-3 text-sm text-destructive">{actionError}</p>}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </Wrapper>
          </Wrapper>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 space-y-6">
        <Wrapper initial="hidden" animate="show" variants={container} className="space-y-4">
          <Wrapper variants={item}>
            <div className="flex gap-2 border-b-2 border-border pb-1">
              <button
                onClick={() => setActiveTab('issue')}
                className={cn(
                  "px-4 py-2 text-sm font-medium transition-colors relative",
                  activeTab === 'issue' ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Active Issues
                {activeTab === 'issue' && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('return')}
                className={cn(
                  "px-4 py-2 text-sm font-medium transition-colors relative",
                  activeTab === 'return' ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Return History
                {activeTab === 'return' && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            </div>
          </Wrapper>

          {isLoadingCirculation ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <Card className="h-24 bg-muted/30" />
                </div>
              ))}
            </div>
          ) : filteredRecords.length === 0 ? (
            <Card className="border-2 border-border/60">
              <CardContent className="py-12 text-center">
                <BookOpen className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-muted-foreground">No {activeTab === 'issue' ? 'active issues' : 'return records'} found</p>
              </CardContent>
            </Card>
          ) : (
            filteredRecords.map((record) => (
              <Wrapper key={record.id} variants={item}>
                <Card className="border-2 border-border/60 hover:border-primary/30 hover:shadow-md transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "p-3 rounded-xl shrink-0",
                        record.status === 'issued' ? 'bg-info/10' : record.status === 'overdue' ? 'bg-destructive/10' : 'bg-success/10'
                      )}>
                        {record.status === 'returned' ? (
                          <CheckCircle className="w-5 h-5 text-success" />
                        ) : record.status === 'overdue' ? (
                          <AlertTriangle className="w-5 h-5 text-destructive" />
                        ) : (
                          <Clock className="w-5 h-5 text-info" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold truncate">{record.bookTitle}</h3>
                          {getStatusBadge(record.status)}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5" />
                            {record.borrowerName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            Issued: {format(new Date(record.issueDate), 'MMM d, yyyy')}
                          </span>
                          <span className="flex items-center gap-1">
                            Due: {format(new Date(record.dueDate), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </div>
                      {record.status !== 'returned' && (
                        <div className="shrink-0">
                          <Button size="sm" onClick={() => handleReturn(record)} disabled={returnBook.isPending}>
                            <ArrowRightLeft className="w-4 h-4 mr-1" />
                            {record.status === 'overdue' ? 'Return & Pay Fine' : 'Return'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Wrapper>
            ))
          )}
        </Wrapper>
      </div>
    </div>
  );
}

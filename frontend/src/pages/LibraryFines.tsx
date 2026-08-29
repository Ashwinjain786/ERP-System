import React, { useState, useMemo } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'motion/react';
import { AlertTriangle, DollarSign, CheckCircle, Clock, Search, Receipt } from 'lucide-react';
import { format } from 'date-fns';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLibraryFines, usePayLibraryFine } from '@/features/library/hooks';
import { cn } from '@/lib/utils';
import type { FineRecord } from '@/api/apiInterface';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

export default function LibraryFines() {
  const reduceMotion = useReducedMotion();
  const Wrapper = reduceMotion ? 'div' : motion.div;
  const { data: fines, isLoading } = useLibraryFines();
  const payFine = usePayLibraryFine();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [selectedFine, setSelectedFine] = useState<FineRecord | null>(null);

  const filteredFines = useMemo(() => {
    if (!fines) return [];
    return fines.filter(fine => {
      const matchesSearch = 
        (fine.userName?.toLowerCase() ?? '').includes(searchQuery.toLowerCase()) ||
        (fine.reason?.toLowerCase() ?? '').includes(searchQuery.toLowerCase()) ||
        fine.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || fine.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [fines, searchQuery, statusFilter]);

  const totalUnpaid = fines?.filter(f => f.status === 'unpaid').reduce((acc, f) => acc + f.amount, 0) || 0;
  const totalPaid = fines?.filter(f => f.status === 'paid').reduce((acc, f) => acc + f.amount, 0) || 0;

  const handlePayment = (fine: FineRecord) => {
    setSelectedFine(fine);
  };

  const confirmPayment = async () => {
    if (!selectedFine) return;
    try {
      await payFine.mutateAsync(selectedFine.id);
      setSelectedFine(null);
    } catch {
      // The mutation error is rendered in the confirmation dialog.
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b-2 border-border/60 bg-gradient-to-r from-primary/5 via-background to-background">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
          <Wrapper initial="hidden" animate="show" className="space-y-6">
            <Wrapper variants={item}>
              <div>
                <h1 className="font-display text-3xl font-bold tracking-tight">Fine Management</h1>
                <p className="mt-1 text-muted-foreground">
                  Track and manage library fines and payments
                </p>
              </div>
            </Wrapper>

            <Wrapper variants={item}>
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-2 border-border/60 bg-card">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Total Unpaid</span>
                      <div className="p-2 rounded-xl bg-destructive/10">
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="font-display text-2xl font-bold tracking-tight text-destructive">₹{totalUnpaid}</span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-2 border-border/60 bg-card">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Total Paid</span>
                      <div className="p-2 rounded-xl bg-success/10">
                        <CheckCircle className="w-4 h-4 text-success" />
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="font-display text-2xl font-bold tracking-tight text-success">₹{totalPaid}</span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-2 border-border/60 bg-card">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Total Fines</span>
                      <div className="p-2 rounded-xl bg-primary/10">
                        <DollarSign className="w-4 h-4 text-primary" />
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="font-display text-2xl font-bold tracking-tight">₹{totalUnpaid + totalPaid}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </Wrapper>

            <Wrapper variants={item}>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by user or reason..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>
                <div className="flex gap-2">
                  {(['all', 'unpaid', 'paid'] as const).map((status) => (
                    <Button
                      key={status}
                      variant={statusFilter === status ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter(status)}
                      className="rounded-lg capitalize"
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </div>
            </Wrapper>
          </Wrapper>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <Card className="h-24 bg-muted/30" />
              </div>
            ))}
          </div>
        ) : filteredFines.length === 0 ? (
          <Card className="border-2 border-border/60">
            <CardContent className="py-12 text-center">
              <Receipt className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
              <h3 className="font-display text-lg font-semibold">No fines found</h3>
              <p className="text-muted-foreground mt-1">Try adjusting your search or filters</p>
            </CardContent>
          </Card>
        ) : (
          <Wrapper variants={container} initial="hidden" animate="show" className="space-y-3">
            {filteredFines.map((fine) => (
              <Wrapper key={fine.id} variants={item}>
                <Card className={cn(
                  "border-2 border-border/60 hover:shadow-md transition-all duration-200",
                  fine.status === 'unpaid' && "border-l-4 border-l-destructive"
                )}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "p-3 rounded-xl shrink-0",
                        fine.status === 'paid' ? 'bg-success/10' : 'bg-destructive/10'
                      )}>
                        {fine.status === 'paid' ? (
                          <CheckCircle className="w-5 h-5 text-success" />
                        ) : (
                          <Clock className="w-5 h-5 text-destructive" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{fine.userName ?? 'Unknown'}</h3>
                          <span className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                            fine.status === 'paid' ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                          )}>
                            {fine.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">{fine.reason ?? 'No reason'}</p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span>ID: {fine.id}</span>
                          <span>Issued: {fine.issuedAt ? format(new Date(fine.issuedAt), 'MMM d, yyyy') : 'N/A'}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={cn(
                          "font-display text-2xl font-bold tabular-nums",
                          fine.status === 'paid' ? "text-success" : "text-destructive"
                        )}>
                          ₹{fine.amount}
                        </p>
                        {fine.status === 'unpaid' && (
                          <Button size="sm" className="mt-2" onClick={() => handlePayment(fine)}>
                            <DollarSign className="w-4 h-4 mr-1" />
                            Pay Now
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Wrapper>
            ))}
          </Wrapper>
        )}
      </div>

      <AnimatePresence>
        {selectedFine && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedFine(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-xl border-2 border-border p-6 max-w-sm w-full shadow-xl"
            >
              <div className="text-center">
                <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto mb-4">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-xl font-bold">Confirm Payment</h3>
                <p className="text-muted-foreground mt-2">
                  Pay fine for {selectedFine.userName}
                </p>
              </div>
              <div className="mt-6 p-4 rounded-xl bg-muted/30">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-semibold">₹{selectedFine.amount}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-muted-foreground">Reason</span>
                  <span className="font-semibold">{selectedFine.reason}</span>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setSelectedFine(null)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={confirmPayment} disabled={payFine.isPending}>
                  {payFine.isPending ? 'Processing...' : 'Confirm Payment'}
                </Button>
                {payFine.isError && <p className="text-sm text-destructive mt-2">{(payFine.error as Error).message}</p>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

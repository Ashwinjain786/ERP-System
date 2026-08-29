import React, { useState, useMemo } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Search, BookOpen, Filter, Tag, MapPin, Layers, Plus, X } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCreateLibraryBook, useLibraryBooks } from '@/features/library/hooks';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

export default function LibraryCatalog() {
  const reduceMotion = useReducedMotion();
  const Wrapper = reduceMotion ? 'div' : motion.div;
  const { data: books, isLoading } = useLibraryBooks();
  const { role } = useAuth();
  const createBook = useCreateLibraryBook();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState({ isbn: '', title: '', author: '', category: '', totalCopies: '1', rackLocation: '' });

  const categories = useMemo(() => [
    'All',
    ...Array.from(new Set((books || []).map(book => book.category).filter((category): category is string => !!category))).sort(),
  ], [books]);

  const handleCreateBook = async (event: React.FormEvent) => {
    event.preventDefault();
    const totalCopies = Number(form.totalCopies);
    if (!form.isbn.trim() || !form.title.trim() || !form.author.trim() || !Number.isInteger(totalCopies) || totalCopies < 1) return;
    try {
      await createBook.mutateAsync({
        isbn: form.isbn.trim(), title: form.title.trim(), author: form.author.trim(),
        category: form.category.trim() || undefined, totalCopies, rackLocation: form.rackLocation.trim() || undefined,
      });
      setForm({ isbn: '', title: '', author: '', category: '', totalCopies: '1', rackLocation: '' });
      setShowCreateForm(false);
    } catch {
      // The mutation error is rendered below the form.
    }
  };

  const filteredBooks = useMemo(() => {
    if (!books) return [];
    return books.filter(book => {
      const matchesSearch = 
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.isbn.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || book.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [books, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b-2 border-border/60 bg-gradient-to-r from-primary/5 via-background to-background">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
          <Wrapper initial="hidden" animate="show" className="space-y-6">
            <Wrapper variants={item}>
              <div className="flex items-start justify-between gap-4">
                <div>
                <h1 className="font-display text-3xl font-bold tracking-tight">Book Catalog</h1>
                <p className="mt-1 text-muted-foreground">
                  Browse and search the library collection
                </p>
                </div>
                {(role === 'librarian' || role === 'admin') && (
                  <Button onClick={() => setShowCreateForm(value => !value)}>
                    {showCreateForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                    {showCreateForm ? 'Close' : 'Add Book'}
                  </Button>
                )}
              </div>
            </Wrapper>

            <Wrapper variants={item}>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by title, author, or ISBN..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>
                <Button 
                  variant="outline" 
                  className="h-11 gap-2"
                  onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                >
                  <Filter className="w-4 h-4" />
                  Clear Filters
                </Button>
              </div>
            </Wrapper>

            <Wrapper variants={item}>
              {showCreateForm && (role === 'librarian' || role === 'admin') && (
                <form onSubmit={handleCreateBook} className="grid gap-3 rounded-xl border-2 border-primary/20 bg-card p-4 md:grid-cols-2 lg:grid-cols-3">
                  <Input required placeholder="ISBN" value={form.isbn} onChange={e => setForm({ ...form, isbn: e.target.value })} />
                  <Input required placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                  <Input required placeholder="Author" value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} />
                  <Input placeholder="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
                  <Input required min="1" step="1" type="number" placeholder="Total copies" value={form.totalCopies} onChange={e => setForm({ ...form, totalCopies: e.target.value })} />
                  <Input placeholder="Rack location" value={form.rackLocation} onChange={e => setForm({ ...form, rackLocation: e.target.value })} />
                  <Button type="submit" disabled={createBook.isPending} className="md:col-span-2 lg:col-span-3">
                    {createBook.isPending ? 'Saving...' : 'Save Book'}
                  </Button>
                  {createBook.isError && <p className="text-sm text-destructive md:col-span-2 lg:col-span-3">{(createBook.error as Error).message}</p>}
                </form>
              )}
            </Wrapper>

            <Wrapper variants={item}>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="rounded-lg"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </Wrapper>
          </Wrapper>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <Card className="h-64 bg-muted/30" />
              </div>
            ))}
          </div>
        ) : (
          <Wrapper variants={container} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredBooks.map((book) => (
              <Wrapper key={book.id} variants={item}>
                <Card className="h-full border-2 border-border/60 bg-card hover:border-primary/30 hover:shadow-md transition-all duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base font-display line-clamp-2">{book.title}</CardTitle>
                        <CardDescription className="mt-1">{book.author}</CardDescription>
                      </div>
                      <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                        <BookOpen className="w-4 h-4 text-primary" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Tag className="w-3.5 h-3.5" />
                      <span className="truncate">{book.category}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="font-mono text-xs">{book.rackLocation}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Layers className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className={cn(
                        "font-medium",
                        book.availableCopies > 0 ? "text-success" : "text-destructive"
                      )}>
                        {book.availableCopies} / {book.totalCopies} available
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Wrapper>
            ))}
          </Wrapper>
        )}

        {!isLoading && filteredBooks.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="font-display text-xl font-semibold">No books found</h3>
            <p className="text-muted-foreground mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

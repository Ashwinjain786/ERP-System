import { useQuery } from '@tanstack/react-query';

import type { Book, CirculationRecord, FineRecord } from '@/api/apiInterface';

const MOCK_BOOKS: Book[] = [
  { id: 'b-001', isbn: '978-0134685991', title: 'Effective Java', author: 'Joshua Bloch', publisher: 'Addison-Wesley', category: 'Programming', rackLocation: 'A-12', totalCopies: 5, availableCopies: 3, coverImageUrl: undefined },
  { id: 'b-002', isbn: '978-0321573513', title: 'Algorithms', author: 'Robert Sedgewick', publisher: 'Pearson', category: 'Computer Science', rackLocation: 'A-15', totalCopies: 8, availableCopies: 5, coverImageUrl: undefined },
  { id: 'b-003', isbn: '978-0596009205', title: 'Head First Design Patterns', author: 'Eric Freeman', publisher: "O'Reilly", category: 'Programming', rackLocation: 'B-03', totalCopies: 4, availableCopies: 2, coverImageUrl: undefined },
  { id: 'b-004', isbn: '978-0132350884', title: 'Clean Code', author: 'Robert C. Martin', publisher: 'Prentice Hall', category: 'Programming', rackLocation: 'A-08', totalCopies: 6, availableCopies: 4, coverImageUrl: undefined },
  { id: 'b-005', isbn: '978-1449373320', title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann', publisher: "O'Reilly", category: 'Database', rackLocation: 'C-11', totalCopies: 3, availableCopies: 1, coverImageUrl: undefined },
];

const MOCK_CIRCULATION: CirculationRecord[] = [
  { id: 'cir-001', bookId: 'b-001', bookTitle: 'Effective Java', borrowerId: 'stu-001', borrowerName: 'Aryan Sharma', issueDate: '2024-02-15T10:00:00Z', dueDate: '2024-03-15T10:00:00Z', status: 'issued' },
  { id: 'cir-002', bookId: 'b-004', bookTitle: 'Clean Code', borrowerId: 'stu-002', borrowerName: 'Priya Singh', issueDate: '2024-02-10T10:00:00Z', dueDate: '2024-03-10T10:00:00Z', status: 'overdue', fineAmount: 50 },
  { id: 'cir-003', bookId: 'b-002', bookTitle: 'Algorithms', borrowerId: 'stu-003', borrowerName: 'Rahul Verma', issueDate: '2024-01-20T10:00:00Z', dueDate: '2024-02-20T10:00:00Z', returnDate: '2024-02-18T10:00:00Z', status: 'returned' },
];

const MOCK_FINES: FineRecord[] = [
  { id: 'fine-001', userId: 'stu-002', userName: 'Priya Singh', amount: 50, reason: 'Overdue book return', status: 'unpaid', issuedAt: '2024-03-10T10:00:00Z' },
  { id: 'fine-002', userId: 'stu-004', userName: 'Ankit Patel', amount: 25, reason: 'Late return', status: 'paid', issuedAt: '2024-02-15T10:00:00Z' },
];

export function useLibraryBooks() {
  return useQuery({
    queryKey: ['library', 'books'],
    queryFn: async () => {
      try {
        return MOCK_BOOKS;
      } catch {
        return MOCK_BOOKS;
      }
    },
  });
}

export function useCirculationRecords() {
  return useQuery({
    queryKey: ['library', 'circulation'],
    queryFn: async () => {
      try {
        return MOCK_CIRCULATION;
      } catch {
        return MOCK_CIRCULATION;
      }
    },
  });
}

export function useLibraryFines() {
  return useQuery({
    queryKey: ['library', 'fines'],
    queryFn: async () => {
      try {
        return MOCK_FINES;
      } catch {
        return MOCK_FINES;
      }
    },
  });
}

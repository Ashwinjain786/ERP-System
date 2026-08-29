import { useQuery } from '@tanstack/react-query';

import type { FeeStructure, FeeTransaction, FeeDefaulter } from '@/api/apiInterface';

const MOCK_FEE_STRUCTURES: FeeStructure[] = [
  { id: 'fs-001', program: 'B.Tech', quota: 'general', tuitionFee: 120000, hostelFee: 40000, examFee: 5000, libraryDeposit: 5000, totalAmount: 170000, dueDate: '2024-07-31' },
  { id: 'fs-002', program: 'B.Tech', quota: 'management', tuitionFee: 180000, hostelFee: 40000, examFee: 5000, libraryDeposit: 5000, totalAmount: 230000, dueDate: '2024-07-31' },
  { id: 'fs-003', program: 'B.Tech', quota: 'merit', tuitionFee: 80000, hostelFee: 40000, examFee: 5000, libraryDeposit: 5000, totalAmount: 130000, dueDate: '2024-07-31' },
  { id: 'fs-004', program: 'M.Tech', quota: 'general', tuitionFee: 80000, hostelFee: 30000, examFee: 3000, libraryDeposit: 3000, totalAmount: 116000, dueDate: '2024-07-31' },
  { id: 'fs-005', program: 'MBA', quota: 'general', tuitionFee: 150000, hostelFee: 35000, examFee: 4000, libraryDeposit: 4000, totalAmount: 193000, dueDate: '2024-07-31' },
];

const MOCK_TRANSACTIONS: FeeTransaction[] = [
  { id: 'txn-001', receiptNumber: 'REC2024001', studentId: 'stu-001', studentName: 'Aryan Sharma', amount: 75000, paymentMethod: 'UPI', status: 'success', paidAt: '2024-04-15T10:30:00Z' },
  { id: 'txn-002', receiptNumber: 'REC2024002', studentId: 'stu-002', studentName: 'Priya Singh', amount: 85000, paymentMethod: 'NetBanking', status: 'success', paidAt: '2024-04-16T11:20:00Z' },
  { id: 'txn-003', receiptNumber: 'REC2024003', studentId: 'stu-003', studentName: 'Rahul Verma', amount: 50000, paymentMethod: 'Challan', status: 'pending', paidAt: '2024-04-17T09:15:00Z' },
  { id: 'txn-004', receiptNumber: 'REC2024004', studentId: 'stu-004', studentName: 'Ankit Patel', amount: 170000, paymentMethod: 'CreditCard', status: 'success', paidAt: '2024-04-18T14:45:00Z' },
  { id: 'txn-005', receiptNumber: 'REC2024005', studentId: 'stu-005', studentName: 'Sneha Reddy', amount: 170000, paymentMethod: 'DebitCard', status: 'success', paidAt: '2024-04-19T10:00:00Z' },
  { id: 'txn-006', receiptNumber: 'REC2024006', studentId: 'stu-006', studentName: 'Karthik Nair', amount: 85000, paymentMethod: 'UPI', status: 'failed', paidAt: '2024-04-20T16:30:00Z' },
];

const MOCK_DEFAULTERS: FeeDefaulter[] = [
  { studentId: 'stu-006', rollNumber: '22CS003', name: 'Karthik Nair', department: 'Computer Science', semester: 4, dueAmount: 85000, daysOverdue: 45 },
  { studentId: 'stu-007', rollNumber: '22ME002', name: 'Vikram Singh', department: 'Mechanical Engineering', semester: 4, dueAmount: 120000, daysOverdue: 60 },
  { studentId: 'stu-008', rollNumber: '22IT002', name: 'Aditya Joshi', department: 'Information Technology', semester: 4, dueAmount: 55000, daysOverdue: 30 },
  { studentId: 'stu-009', rollNumber: '22EE002', name: 'Rohit Sharma', department: 'Electrical Engineering', semester: 6, dueAmount: 90000, daysOverdue: 25 },
  { studentId: 'stu-010', rollNumber: '22CE001', name: 'Priya Gupta', department: 'Civil Engineering', semester: 4, dueAmount: 75000, daysOverdue: 15 },
];

export function useFeeStructures() {
  return useQuery({
    queryKey: ['finance', 'fee-structures'],
    queryFn: async () => {
      try {
        return MOCK_FEE_STRUCTURES;
      } catch {
        return MOCK_FEE_STRUCTURES;
      }
    },
  });
}

export function useFeeTransactions() {
  return useQuery({
    queryKey: ['finance', 'transactions'],
    queryFn: async () => {
      try {
        return MOCK_TRANSACTIONS;
      } catch {
        return MOCK_TRANSACTIONS;
      }
    },
  });
}

export function useFeeDefaulters() {
  return useQuery({
    queryKey: ['finance', 'defaulters'],
    queryFn: async () => {
      try {
        return MOCK_DEFAULTERS;
      } catch {
        return MOCK_DEFAULTERS;
      }
    },
  });
}

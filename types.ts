
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export interface User {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: number;
  subscription?: {
    plan: 'FREE' | 'PREMIUM';
    status: 'ACTIVE' | 'INACTIVE';
    startDate: number;
    endDate: number;
    transactionId?: string;
  };
}

export interface Transaction {
  id: string;
  uid: string;
  type: TransactionType;
  amount: number;
  category: string;
  wallet: string;
  note: string;
  date: string;
  createdAt: number;
}

export interface Category {
  id: string;
  name: string;
  nameBn: string;
  icon: string;
  createdBy: string;
}

export interface ActivityLog {
  id: string;
  uid: string;
  action: string;
  timestamp: number;
}

export type WalletType = 'Cash' | 'Bank' | 'bKash' | 'Nagad';

export interface AppState {
  transactions: Transaction[];
  categories: Category[];
  user: User | null;
  loading: boolean;
  language: 'EN' | 'BN';
  theme: 'light' | 'dark';
}

export type TransactionType = 'expense' | 'income' | 'transfer';

export interface Category {
  id: string;
  name: string;
  icon: string; // Lucide icon name
  color: string;
  type: TransactionType;
}

export interface Account {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'credit' | 'alipay' | 'wechat' | 'investment';
  balance: number;
  color: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  accountId: string;
  date: string; // ISO String
  note: string;
}

export interface Budget {
  categoryId: string; // 'all' for total budget
  amount: number;
  period: 'month';
}

export interface User {
  id: string;
  username: string;
  avatar?: string;
  isGuest?: boolean;
}
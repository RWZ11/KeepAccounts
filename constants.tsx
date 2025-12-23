import { Category, Account } from './types';
import { 
  Utensils, Bus, ShoppingBag, Clapperboard, Stethoscope, 
  GraduationCap, Home, Briefcase, Wallet, DollarSign,
  Coffee, Smartphone, Plane, Gift, Zap
} from 'lucide-react';
import React from 'react';

export const DEFAULT_CATEGORIES: Category[] = [
  // Expense
  { id: 'c1', name: 'Dining', icon: 'Utensils', color: 'bg-orange-100 text-orange-600', type: 'expense' },
  { id: 'c2', name: 'Transport', icon: 'Bus', color: 'bg-blue-100 text-blue-600', type: 'expense' },
  { id: 'c3', name: 'Shopping', icon: 'ShoppingBag', color: 'bg-pink-100 text-pink-600', type: 'expense' },
  { id: 'c4', name: 'Entertainment', icon: 'Clapperboard', color: 'bg-purple-100 text-purple-600', type: 'expense' },
  { id: 'c5', name: 'Health', icon: 'Stethoscope', color: 'bg-red-100 text-red-600', type: 'expense' },
  { id: 'c6', name: 'Education', icon: 'GraduationCap', color: 'bg-indigo-100 text-indigo-600', type: 'expense' },
  { id: 'c7', name: 'Housing', icon: 'Home', color: 'bg-teal-100 text-teal-600', type: 'expense' },
  { id: 'c8', name: 'Bills', icon: 'Zap', color: 'bg-yellow-100 text-yellow-600', type: 'expense' },
  // Income
  { id: 'c9', name: 'Salary', icon: 'Briefcase', color: 'bg-emerald-100 text-emerald-600', type: 'income' },
  { id: 'c10', name: 'Investment', icon: 'DollarSign', color: 'bg-cyan-100 text-cyan-600', type: 'income' },
  { id: 'c11', name: 'Gift', icon: 'Gift', color: 'bg-rose-100 text-rose-600', type: 'income' },
];

export const INITIAL_ACCOUNTS: Account[] = [];

// Helper to render icons dynamically
export const IconRenderer = ({ name, className }: { name: string, className?: string }) => {
  const icons: Record<string, React.ReactNode> = {
    Utensils: <Utensils className={className} />,
    Bus: <Bus className={className} />,
    ShoppingBag: <ShoppingBag className={className} />,
    Clapperboard: <Clapperboard className={className} />,
    Stethoscope: <Stethoscope className={className} />,
    GraduationCap: <GraduationCap className={className} />,
    Home: <Home className={className} />,
    Zap: <Zap className={className} />,
    Briefcase: <Briefcase className={className} />,
    DollarSign: <DollarSign className={className} />,
    Gift: <Gift className={className} />,
    Wallet: <Wallet className={className} />,
    Coffee: <Coffee className={className} />,
    Smartphone: <Smartphone className={className} />,
    Plane: <Plane className={className} />,
  };
  return <>{icons[name] || <DollarSign className={className} />}</>;
};

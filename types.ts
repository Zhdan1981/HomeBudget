import { LucideIcon } from 'lucide-react';

export enum CategoryType {
    Personal = "Личные",
    Expenses = "Расходы",
    Shared = "Общие"
}

export enum TransactionType {
    Expense = "Расход",
    Income = "Доход",
    Transfer = "Перевод"
}

export interface Category {
    id: string;
    name: string;
    type: CategoryType;
    balance: number;
    icon: string; // Corresponds to key in ICONS map
    color: string; // Tailwind color class
}

export interface Transaction {
    id: string;
    categoryId: string;
    amount: number;
    type: TransactionType;
    participant: string;
    note: string;
    date: string; // ISO string
    toCategoryId?: string; // For transfers
}

export type Theme = 'Полночь' | 'Океан' | 'Графит' | 'Космос' | 'Глубина' | 'Облако' | 'Мята' | 'Песок' | 'Бумага' | 'Зефир';

export interface User {
  id: string;
  email: string;
  password?: string; // Should be hashed in a real app
}
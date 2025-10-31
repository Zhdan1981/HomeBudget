
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

export enum Participant {
    Me = "Ждан",
    Nadya = "Надя",
    Andrey = "Андрей",
    Dasha = "Даша",
    Shared = "Общие"
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
    participant: Participant;
    note: string;
    date: string; // ISO string
    toCategoryId?: string; // For transfers
}

export type Theme = 'Полночь' | 'Океан' | 'Графит' | 'Космос' | 'Глубина' | 'Облако' | 'Мята' | 'Песок' | 'Бумага' | 'Зефир';
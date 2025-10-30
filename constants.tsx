import { Category, CategoryType, Theme } from './types';
// fix: Corrected icon import from UtensilsCross to UtensilsCrossed and updated references.
import { User, Users, Wallet, Fuel, UtensilsCrossed, Plane, Warehouse, ShoppingCart, Banknote, Landmark } from 'lucide-react';
import React from 'react';

export const THEMES: Theme[] = [
    'Полночь', 'Океан', 'Графит', 'Космос', 'Глубина',
    'Облако', 'Мята', 'Песок', 'Бумага', 'Зефир'
];

export const ICONS: { [key: string]: React.FC<React.SVGProps<SVGSVGElement>> } = {
    User, Users, Wallet, Fuel, UtensilsCrossed, Plane, Warehouse, ShoppingCart, Banknote, Landmark
};

export const INITIAL_CATEGORIES: Category[] = [
    { id: "1", name: "Мои", type: CategoryType.Personal, balance: 63964.00, icon: "User", color: "text-sky-400" },
    { id: "2", name: "Надя", type: CategoryType.Personal, balance: 5551.37, icon: "User", color: "text-pink-400" },
    { id: "3", name: "Андрей", type: CategoryType.Personal, balance: 0.00, icon: "User", color: "text-amber-400" },
    { id: "4", name: "Суши", type: CategoryType.Expenses, balance: 0.00, icon: "UtensilsCrossed", color: "text-emerald-400" },
    { id: "5", name: "Отпуск", type: CategoryType.Shared, balance: 546153.00, icon: "Plane", color: "text-blue-400" },
    { id: "6", name: "Гараж", type: CategoryType.Expenses, balance: 6429.00, icon: "Warehouse", color: "text-orange-400" },
    { id: "7", name: "Бензин", type: CategoryType.Expenses, balance: 0.00, icon: "Fuel", color: "text-red-400" },
    { id: "8", name: "Продукты", type: CategoryType.Expenses, balance: 0.00, icon: "ShoppingCart", color: "text-lime-400" },
    { id: "9", name: "Ozon", type: CategoryType.Expenses, balance: 0.00, icon: "ShoppingCart", color: "text-indigo-400" },
    { id: "10", name: "WB", type: CategoryType.Expenses, balance: 0.00, icon: "ShoppingCart", color: "text-purple-400" },
    { id: "11", name: "КЭШ", type: CategoryType.Personal, balance: 10000.00, icon: "Banknote", color: "text-green-500" },
    { id: "12", name: "Сбербанк", type: CategoryType.Personal, balance: 0.00, icon: "Landmark", color: "text-green-600" },
];
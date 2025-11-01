import { Category, Theme } from './types';
// fix: Corrected icon import from UtensilsCross to UtensilsCrossed and updated references.
import { User, Users, Wallet, Fuel, UtensilsCrossed, Plane, Warehouse, ShoppingCart, Banknote, Landmark, Package, Store, ShoppingBag, ShoppingBasket, Shrimp } from 'lucide-react';
import React from 'react';

export const THEMES: Theme[] = [
    'Полночь', 'Океан', 'Графит', 'Космос', 'Глубина',
    'Облако', 'Мята', 'Песок', 'Бумага', 'Зефир'
];

export const ICONS: { [key: string]: React.FC<React.SVGProps<SVGSVGElement>> } = {
    User, Users, Wallet, Fuel, UtensilsCrossed, Plane, Warehouse, ShoppingCart, Banknote, Landmark, Package, Store, ShoppingBag, ShoppingBasket, Shrimp
};

export const CATEGORY_COLORS = [
    "text-sky-400", "text-pink-400", "text-amber-400", "text-emerald-400",
    "text-blue-400", "text-orange-400", "text-red-400", "text-lime-400",
    "text-indigo-400", "text-purple-400", "text-green-500", "text-cyan-400",
    "text-violet-400", "text-rose-400", "text-teal-400", "text-fuchsia-400"
];

export const INITIAL_CATEGORIES: Category[] = [
    { id: "1", name: "Ждан", balance: 63964.00, icon: "User", color: "text-sky-400" },
    { id: "2", name: "Надя", balance: 5551.37, icon: "User", color: "text-pink-400" },
    { id: "3", name: "Андрей", balance: 0.00, icon: "User", color: "text-amber-400" },
    { id: "4", name: "Суши", balance: 0.00, icon: "Shrimp", color: "text-emerald-400" },
    { id: "5", name: "Отпуск", balance: 546153.00, icon: "Plane", color: "text-blue-400" },
    { id: "6", name: "Гараж", balance: 6429.00, icon: "Warehouse", color: "text-orange-400" },
    { id: "7", name: "Бензин", balance: 0.00, icon: "Fuel", color: "text-red-400" },
    { id: "8", name: "Продукты", balance: 0.00, icon: "ShoppingCart", color: "text-lime-400" },
    { id: "9", name: "Ozon", balance: 0.00, icon: "ShoppingBag", color: "text-indigo-400" },
    { id: "10", name: "WB", balance: 0.00, icon: "ShoppingBasket", color: "text-purple-400" },
    { id: "11", name: "КЭШ", balance: 10000.00, icon: "Banknote", color: "text-green-500" },
    { id: "12", name: "ЖКХ", balance: 0.00, icon: "Landmark", color: "text-cyan-400" },
    { id: "13", name: "Даша", balance: 0.00, icon: "User", color: "text-violet-400" },
];
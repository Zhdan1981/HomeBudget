
import React from 'react';
import { Category, CategoryType } from '../types';
import { ICONS } from '../constants';

interface BudgetCategoryCardProps {
    category: Category;
    onClick: () => void;
    onUpdateBalance: (newBalance: number) => void;
    onDragStart: () => void;
    onDragEnter: () => void;
    onDragEnd: () => void;
    onDragOver: (e: React.DragEvent) => void;
    isDragging: boolean;
}

const BudgetCategoryCard: React.FC<BudgetCategoryCardProps> = ({ category, onClick, onDragStart, onDragEnter, onDragEnd, onDragOver, isDragging }) => {
    const IconComponent = ICONS[category.icon] || ICONS['Wallet'];

    const categoryTypeStyles: { [key in CategoryType]: string } = {
        [CategoryType.Personal]: 'text-sky-500',
        [CategoryType.Expenses]: 'text-amber-500',
        [CategoryType.Shared]: 'text-emerald-500',
    };

    const formattedBalance = new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 2,
    }).format(category.balance);

    return (
        <div 
            onClick={onClick}
            draggable
            onDragStart={onDragStart}
            onDragEnter={onDragEnter}
            onDragEnd={onDragEnd}
            onDragOver={onDragOver}
            className={`bg-card p-4 rounded-xl flex items-center gap-4 shadow-sm transition-all duration-200 hover:bg-border cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-50 scale-105' : ''}`}
        >
            <div className={`p-3 rounded-full bg-background ${category.color}`}>
                <IconComponent className="w-6 h-6" />
            </div>
            <div className="flex-grow">
                <p className="font-semibold text-text-primary">{category.name}</p>
                <p className={`mt-1 text-xs font-semibold ${categoryTypeStyles[category.type]}`}>
                    {category.type}
                </p>
            </div>
            <p 
                className="font-bold text-lg text-text-primary whitespace-nowrap"
            >
                {formattedBalance}
            </p>
        </div>
    );
};

export default BudgetCategoryCard;
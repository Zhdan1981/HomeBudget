import React from 'react';
import { Category, CategoryType } from '../types';
import { ICONS } from '../constants';

interface BudgetCategoryCardProps {
    category: Category;
    onClick: () => void;
}

const BudgetCategoryCard: React.FC<BudgetCategoryCardProps> = ({ category, onClick }) => {
    const IconComponent = ICONS[category.icon] || ICONS['Wallet'];
    const formattedBalance = new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 2,
    }).format(category.balance);

    const categoryTypeStyles: { [key in CategoryType]: string } = {
        [CategoryType.Personal]: 'text-sky-500',
        [CategoryType.Expenses]: 'text-amber-500',
        [CategoryType.Shared]: 'text-emerald-500',
    };

    return (
        <div 
            onClick={onClick}
            className="bg-card p-4 rounded-xl flex items-center gap-4 shadow-sm hover:bg-border transition-colors duration-200 cursor-pointer"
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
            <p className="font-bold text-lg text-text-primary whitespace-nowrap">{formattedBalance}</p>
        </div>
    );
};

export default BudgetCategoryCard;
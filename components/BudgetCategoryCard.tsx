
import React from 'react';
import { Category } from '../types';
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

    return (
        <div 
            onClick={onClick}
            className="bg-card p-4 rounded-xl flex items-center gap-4 shadow-sm hover:shadow-lg transition-shadow cursor-pointer active:scale-95 duration-200"
        >
            <div className={`p-3 rounded-full bg-background ${category.color}`}>
                <IconComponent className="w-6 h-6" />
            </div>
            <div className="flex-grow">
                <p className="font-semibold text-text-primary">{category.name}</p>
                <p className="text-sm text-text-secondary">{category.type}</p>
            </div>
            <p className="font-bold text-lg text-text-primary whitespace-nowrap">{formattedBalance}</p>
        </div>
    );
};

export default BudgetCategoryCard;

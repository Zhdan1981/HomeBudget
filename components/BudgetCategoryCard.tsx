import React, { useState, useEffect, useRef } from 'react';
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

const BudgetCategoryCard: React.FC<BudgetCategoryCardProps> = ({ category, onClick, onUpdateBalance, onDragStart, onDragEnter, onDragEnd, onDragOver, isDragging }) => {
    const IconComponent = ICONS[category.icon] || ICONS['Wallet'];
    const [isEditing, setIsEditing] = useState(false);
    const [currentBalance, setCurrentBalance] = useState(category.balance.toString());
    const inputRef = useRef<HTMLInputElement>(null);

    const categoryTypeStyles: { [key in CategoryType]: string } = {
        [CategoryType.Personal]: 'text-sky-500',
        [CategoryType.Expenses]: 'text-amber-500',
        [CategoryType.Shared]: 'text-emerald-500',
    };

    useEffect(() => {
        setCurrentBalance(category.balance.toString());
    }, [category.balance]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleBalanceClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEditing(true);
    };

    const handleBlur = () => {
        const newBalance = parseFloat(currentBalance.replace(',', '.'));
        if (!isNaN(newBalance) && newBalance !== category.balance) {
            onUpdateBalance(newBalance);
        } else {
            setCurrentBalance(category.balance.toString());
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleBlur();
        } else if (e.key === 'Escape') {
            setCurrentBalance(category.balance.toString());
            setIsEditing(false);
        }
    };

    const formattedBalance = new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 2,
    }).format(category.balance);

    return (
        <div 
            onClick={isEditing ? undefined : onClick}
            draggable={!isEditing}
            onDragStart={onDragStart}
            onDragEnter={onDragEnter}
            onDragEnd={onDragEnd}
            onDragOver={onDragOver}
            className={`bg-card p-4 rounded-xl flex items-center gap-4 shadow-sm transition-colors duration-200 hover:bg-border ${!isEditing ? 'cursor-grab active:cursor-grabbing' : ''} ${isDragging ? 'opacity-50' : ''}`}
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
            {isEditing ? (
                <input
                    ref={inputRef}
                    type="text"
                    inputMode="decimal"
                    value={currentBalance}
                    onChange={(e) => setCurrentBalance(e.target.value.replace(',', '.'))}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    onClick={(e) => e.stopPropagation()}
                    className="font-bold text-lg text-right bg-transparent border-b-2 border-accent text-text-primary w-32 outline-none p-0 m-0"
                />
            ) : (
                <p 
                    onClick={handleBalanceClick} 
                    className="font-bold text-lg text-text-primary whitespace-nowrap cursor-text"
                >
                    {formattedBalance}
                </p>
            )}
        </div>
    );
};

export default BudgetCategoryCard;
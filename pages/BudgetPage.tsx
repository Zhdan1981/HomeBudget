

import React, { useState, useMemo } from 'react';
import { useBudget } from '../hooks/useBudget';
import Header from '../components/Header';
import BudgetCategoryCard from '../components/BudgetCategoryCard';
import { Category, CategoryType } from '../types';
import { useNavigate } from 'react-router-dom';

const BudgetPage: React.FC = () => {
    const { state, dispatch } = useBudget();
    const navigate = useNavigate();
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragEnter = (index: number) => {
        if (draggedIndex === null || draggedIndex === index) return;
        
        const newCategories = [...state.categories];
        const draggedItem = newCategories.splice(draggedIndex, 1)[0];
        newCategories.splice(index, 0, draggedItem);
        
        dispatch({ type: 'REORDER_CATEGORIES', payload: newCategories });
        setDraggedIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    const totalBalance = useMemo(() => {
        return state.categories
            .filter(cat => cat.type === CategoryType.Personal || cat.type === CategoryType.Shared)
            .reduce((sum, cat) => sum + cat.balance, 0);
    }, [state.categories]);

    const handleCardClick = (category: Category) => {
        navigate(`/category/${category.id}`);
    };

    const handleBalanceUpdate = (categoryId: string, newBalance: number) => {
        dispatch({
            type: 'UPDATE_CATEGORY_BALANCE',
            payload: { categoryId, balance: newBalance },
        });
    };

    const formattedTotalBalance = new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(totalBalance);
    
    const lastUpdated = new Date().toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <div className="max-w-md mx-auto">
            <Header />
            
            <section className="text-center p-4">
                <p className="text-sm text-text-secondary">Общий баланс</p>
                <h1 className="text-4xl font-bold text-accent my-2 tracking-tight">
                    {formattedTotalBalance.replace('₽', '').trim()} <span className="text-3xl text-accent/80">₽</span>
                </h1>
                <p className="text-xs text-text-secondary">Обновлено: {lastUpdated}</p>
            </section>

            <section className="p-4 space-y-3">
                {state.categories.map((category, index) => (
                    <BudgetCategoryCard 
                        key={category.id} 
                        category={category}
                        onClick={() => handleCardClick(category)}
                        onUpdateBalance={(newBalance) => handleBalanceUpdate(category.id, newBalance)}
                        onDragStart={() => handleDragStart(index)}
                        onDragEnter={() => handleDragEnter(index)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => e.preventDefault()}
                        isDragging={draggedIndex === index}
                    />
                ))}
            </section>
        </div>
    );
};

export default BudgetPage;
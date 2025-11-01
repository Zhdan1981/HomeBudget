

import React, { useState, useMemo } from 'react';
import { useBudget } from '../hooks/useBudget';
import Header from '../components/Header';
import BudgetCategoryCard from '../components/BudgetCategoryCard';
import { Category } from '../types';
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
        return state.categories.reduce((sum, cat) => sum + cat.balance, 0);
    }, [state.categories]);

    const handleCardClick = (category: Category) => {
        navigate(`/category/${category.id}`);
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
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md">
                <Header />
                <section className="text-center px-4 pb-2">
                    <p className="text-sm text-text-secondary">Общий баланс</p>
                    <h1 className="text-4xl font-bold text-accent my-2 tracking-tight">
                        {formattedTotalBalance.replace('₽', '').trim()} <span className="text-3xl text-accent/80">₽</span>
                    </h1>
                    <p className="text-xs text-text-secondary">Обновлено: {lastUpdated}</p>
                </section>
            </div>

            <section className="p-4 space-y-3">
                {state.categories.map((category, index) => (
                    <BudgetCategoryCard 
                        key={category.id} 
                        category={category}
                        onClick={() => handleCardClick(category)}
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
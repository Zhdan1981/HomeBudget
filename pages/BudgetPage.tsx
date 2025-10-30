
import React, { useState, useMemo } from 'react';
import { useBudget } from '../hooks/useBudget';
import Header from '../components/Header';
import BudgetCategoryCard from '../components/BudgetCategoryCard';
import ThemeSwitcher from '../components/ThemeSwitcher';
import AddTransactionModal from '../components/AddTransactionModal';
import { Category } from '../types';

const BudgetPage: React.FC = () => {
    const { state } = useBudget();
    const [isThemeSwitcherOpen, setThemeSwitcherOpen] = useState(false);
    const [isTransactionModalOpen, setTransactionModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    const totalBalance = useMemo(() => {
        return state.categories.reduce((sum, cat) => sum + cat.balance, 0);
    }, [state.categories]);

    const handleCardClick = (category: Category) => {
        setSelectedCategory(category);
        setTransactionModalOpen(true);
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
            <Header onThemeClick={() => setThemeSwitcherOpen(true)} />
            
            <section className="text-center p-4">
                <p className="text-sm text-text-secondary">Общий баланс</p>
                <h1 className="text-5xl font-bold text-accent my-2 tracking-tight">
                    {formattedTotalBalance.replace('₽', '').trim()} <span className="text-4xl text-accent/80">₽</span>
                </h1>
                <p className="text-xs text-text-secondary">Обновлено: {lastUpdated}</p>
            </section>

            <section className="p-4 space-y-3">
                {state.categories.map(category => (
                    <BudgetCategoryCard 
                        key={category.id} 
                        category={category}
                        onClick={() => handleCardClick(category)}
                    />
                ))}
            </section>
            
            <ThemeSwitcher 
                isOpen={isThemeSwitcherOpen} 
                onClose={() => setThemeSwitcherOpen(false)}
            />
            <AddTransactionModal
                isOpen={isTransactionModalOpen}
                onClose={() => setTransactionModalOpen(false)}
                category={selectedCategory}
            />
        </div>
    );
};

export default BudgetPage;

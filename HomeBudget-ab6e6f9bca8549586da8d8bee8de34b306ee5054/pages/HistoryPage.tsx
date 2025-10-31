import React, { useState, useMemo } from 'react';
import { useBudget } from '../hooks/useBudget';
import { TransactionType, Participant } from '../types';
import { Filter } from 'lucide-react';

const HistoryPage: React.FC = () => {
    const { state } = useBudget();
    const { transactions, categories } = state;

    // Filter state
    const [showFilters, setShowFilters] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);

    const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || 'Неизвестно';

    const filteredAndSortedTransactions = useMemo(() => {
        let filtered = [...transactions];

        if (startDate) {
            filtered = filtered.filter(tx => new Date(tx.date) >= new Date(startDate));
        }

        if (endDate) {
            const end = new Date(endDate);
            end.setDate(end.getDate() + 1); // Include all of the end date
            filtered = filtered.filter(tx => new Date(tx.date) < end);
        }

        if (selectedCategories.length > 0) {
            filtered = filtered.filter(tx => selectedCategories.includes(tx.categoryId));
        }

        if (selectedParticipants.length > 0) {
            filtered = filtered.filter(tx => selectedParticipants.includes(tx.participant));
        }

        return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions, startDate, endDate, selectedCategories, selectedParticipants]);
    
    const handleResetFilters = () => {
        setStartDate('');
        setEndDate('');
        setSelectedCategories([]);
        setSelectedParticipants([]);
    };
    
    const handleMultiSelect = (setter: React.Dispatch<React.SetStateAction<string[]>>) => (e: React.ChangeEvent<HTMLSelectElement>) => {
        const options = Array.from(e.target.selectedOptions, option => option.value);
        setter(options);
    };

    return (
        <div className="p-4 max-w-md mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-text-primary">История транзакций</h1>
                <button 
                    onClick={() => setShowFilters(!showFilters)} 
                    className="flex items-center gap-2 p-2 rounded-lg bg-card hover:bg-border text-text-secondary hover:text-text-primary transition-colors"
                    aria-expanded={showFilters}
                    aria-controls="filter-panel"
                >
                    <Filter size={20} />
                    <span>Фильтры</span>
                </button>
            </div>
            
            {showFilters && (
                <div id="filter-panel" className="bg-card p-4 rounded-lg mb-6 space-y-4 animate-fade-in">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="start-date" className="block text-sm font-medium text-text-secondary mb-1">От</label>
                            <input
                                type="date"
                                id="start-date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full bg-background border border-border rounded-lg p-2 text-text-primary focus:ring-2 focus:ring-accent outline-none"
                            />
                        </div>
                        <div>
                            <label htmlFor="end-date" className="block text-sm font-medium text-text-secondary mb-1">До</label>
                            <input
                                type="date"
                                id="end-date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full bg-background border border-border rounded-lg p-2 text-text-primary focus:ring-2 focus:ring-accent outline-none"
                            />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="category-select" className="block text-sm font-medium text-text-secondary mb-1">Категории</label>
                        <select
                            id="category-select"
                            multiple
                            value={selectedCategories}
                            onChange={handleMultiSelect(setSelectedCategories)}
                            className="w-full bg-background border border-border rounded-lg p-2 text-text-primary focus:ring-2 focus:ring-accent outline-none h-24"
                        >
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="participant-select" className="block text-sm font-medium text-text-secondary mb-1">Участники</label>
                        <select
                            id="participant-select"
                            multiple
                            value={selectedParticipants}
                            onChange={handleMultiSelect(setSelectedParticipants)}
                            className="w-full bg-background border border-border rounded-lg p-2 text-text-primary focus:ring-2 focus:ring-accent outline-none"
                        >
                            {Object.values(Participant).map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                    <div className="flex justify-end gap-2">
                         <button onClick={handleResetFilters} className="px-4 py-2 rounded-lg text-sm font-semibold bg-background hover:bg-border">
                            Сбросить
                        </button>
                    </div>
                </div>
            )}

            {filteredAndSortedTransactions.length === 0 ? (
                <p className="text-text-secondary text-center mt-8">Транзакции не найдены.</p>
            ) : (
                <ul className="space-y-3">
                    {filteredAndSortedTransactions.map(tx => {
                        const amountColor = tx.type === TransactionType.Income ? 'text-green-500' : 
                                            tx.type === TransactionType.Transfer ? 'text-blue-500' : 'text-red-500';
                        const sign = tx.type === TransactionType.Income ? '+' : '-';
                        
                        const formattedAmount = new Intl.NumberFormat('ru-RU', {
                            style: 'currency',
                            currency: 'RUB'
                        }).format(Math.abs(tx.amount));

                        return (
                            <li key={tx.id} className="bg-card p-4 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-text-primary">
                                        {tx.type === TransactionType.Transfer
                                            ? `${getCategoryName(tx.categoryId)} → ${getCategoryName(tx.toCategoryId!)}`
                                            : getCategoryName(tx.categoryId)}
                                    </p>
                                    <p className="text-sm text-text-secondary">{tx.note || tx.type}</p>
                                    <p className="text-xs text-text-secondary mt-1">
                                        {new Date(tx.date).toLocaleString('ru-RU')} ({tx.participant})
                                    </p>
                                </div>
                                <div className={`${amountColor} font-bold text-lg`}>
                                    {tx.type !== TransactionType.Transfer && sign} {formattedAmount}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default HistoryPage;
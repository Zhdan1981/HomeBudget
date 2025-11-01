

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useBudget } from '../hooks/useBudget';
import { Transaction, TransactionType, CategoryType } from '../types';
import { Filter, ArrowDownUp, X, Check } from 'lucide-react';
import { ICONS } from '../constants';

type SortOption = 'date-desc' | 'date-asc' | 'category-asc' | 'category-desc' | 'amount-desc' | 'amount-asc';

const SORT_OPTIONS: { key: SortOption; label: string }[] = [
    { key: 'date-desc', label: 'Сначала новые' },
    { key: 'date-asc', label: 'Сначала старые' },
    { key: 'amount-desc', label: 'Сумма (убывание)' },
    { key: 'amount-asc', label: 'Сумма (возрастание)' },
    { key: 'category-asc', label: 'Категория (А-Я)' },
    { key: 'category-desc', label: 'Категория (Я-А)' },
];

const HistoryPage: React.FC = () => {
    const { state } = useBudget();
    const { transactions, categories, participants } = state;

    // State for UI
    const [showFilters, setShowFilters] = useState(false);
    const [showSortOptions, setShowSortOptions] = useState(false);
    
    // State for filtering
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
    
    // State for sorting
    const [sortOption, setSortOption] = useState<SortOption>('date-desc');

    const filtersRef = useRef<HTMLDivElement>(null);
    const sortRef = useRef<HTMLDivElement>(null);

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filtersRef.current && !filtersRef.current.contains(event.target as Node)) {
                setShowFilters(false);
            }
            if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
                setShowSortOptions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleSort = () => {
        setShowSortOptions(prev => !prev);
        setShowFilters(false);
    };

    const toggleFilters = () => {
        setShowFilters(prev => !prev);
        setShowSortOptions(false);
    };

    const activeFilterCount =
        (startDate ? 1 : 0) +
        (endDate ? 1 : 0) +
        selectedCategories.length +
        selectedParticipants.length;

    const getCategory = (id: string) => categories.find(c => c.id === id);

    const processedTransactions = useMemo(() => {
        let filtered = [...transactions];

        // Filtering logic
        if (startDate) filtered = filtered.filter(tx => new Date(tx.date) >= new Date(startDate));
        if (endDate) {
            const end = new Date(endDate);
            end.setDate(end.getDate() + 1);
            filtered = filtered.filter(tx => new Date(tx.date) < end);
        }
        if (selectedCategories.length > 0) {
            filtered = filtered.filter(tx => selectedCategories.includes(tx.categoryId) || (tx.toCategoryId && selectedCategories.includes(tx.toCategoryId)));
        }
        if (selectedParticipants.length > 0) {
            filtered = filtered.filter(tx => selectedParticipants.includes(tx.participant));
        }

        // Sorting logic
        const getCategoryName = (id: string) => getCategory(id)?.name || 'ЯЯЯ';
        filtered.sort((a, b) => {
            switch(sortOption) {
                case 'date-asc': return new Date(a.date).getTime() - new Date(b.date).getTime();
                case 'category-asc': return getCategoryName(a.categoryId).localeCompare(getCategoryName(b.categoryId));
                case 'category-desc': return getCategoryName(b.categoryId).localeCompare(getCategoryName(a.categoryId));
                case 'amount-asc': return Math.abs(a.type === TransactionType.Income ? -a.amount : a.amount) - Math.abs(b.type === TransactionType.Income ? -b.amount : b.amount);
                case 'amount-desc': return Math.abs(b.type === TransactionType.Income ? -b.amount : b.amount) - Math.abs(a.type === TransactionType.Income ? -a.amount : a.amount);
                case 'date-desc':
                default: return new Date(b.date).getTime() - new Date(a.date).getTime();
            }
        });

        if (sortOption === 'date-desc' || sortOption === 'date-asc') {
            // FIX: Explicitly type the accumulator in the reduce function to prevent type inference issues.
            // This ensures the return value is correctly typed as Record<string, Transaction[]>,
            // resolving downstream TypeScript errors where the value was being inferred as `unknown`.
            return filtered.reduce((acc: Record<string, Transaction[]>, tx) => {
                const dateKey = tx.date.split('T')[0];
                if (!acc[dateKey]) {
                    acc[dateKey] = [];
                }
                acc[dateKey].push(tx);
                return acc;
            }, {});
        }
        
        return filtered;
    }, [transactions, startDate, endDate, selectedCategories, selectedParticipants, sortOption, categories]);

    const handleResetFilters = () => {
        setStartDate('');
        setEndDate('');
        setSelectedCategories([]);
        setSelectedParticipants([]);
    };
    
    // FIX: Explicitly type the `option` parameter as `HTMLOptionElement` to resolve a TypeScript error where it was being inferred as `unknown`.
    const handleMultiSelect = (setter: React.Dispatch<React.SetStateAction<string[]>>) => (e: React.ChangeEvent<HTMLSelectElement>) => {
        setter(Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value));
    };

    const formatDateGroup = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return 'Сегодня';
        if (date.toDateString() === yesterday.toDateString()) return 'Вчера';
        
        return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    };

    const renderTransactionItem = (tx: Transaction) => {
        const fromCategory = getCategory(tx.categoryId);
        const toCategory = tx.toCategoryId ? getCategory(tx.toCategoryId) : null;
        const Icon = fromCategory ? (ICONS[fromCategory.icon] || ICONS.Wallet) : ICONS.Wallet;
        const color = fromCategory ? fromCategory.color : 'text-gray-400';
        
        let title = fromCategory?.name || 'Неизвестно';
        if (tx.type === TransactionType.Transfer && toCategory) {
            title = `${fromCategory?.name} → ${toCategory.name}`;
        }
        
        const amountColor = tx.type === TransactionType.Income ? 'text-green-500' : 
                            tx.type === TransactionType.Transfer ? 'text-blue-500' : 'text-red-500';
        const sign = tx.type === TransactionType.Income ? '+' : '-';
        const formattedAmount = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(Math.abs(tx.amount));

        return (
            <li key={tx.id} className="bg-card p-3 rounded-lg flex items-center gap-4">
                <div className={`p-2 rounded-full ${color.replace('text-', 'bg-')}/20 ${color}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div className="flex-grow">
                    <p className="font-semibold text-text-primary">{title}</p>
                    <p className="text-sm text-text-secondary">{tx.note || tx.participant}</p>
                </div>
                <div className="text-right">
                    <p className={`${amountColor} font-bold text-lg whitespace-nowrap`}>
                        {tx.type !== TransactionType.Transfer && sign} {formattedAmount}
                    </p>
                     <p className="text-xs text-text-secondary mt-1">
                        {new Date(tx.date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
            </li>
        );
    };
    
    const calculateDailyTotal = (dailyTransactions: Transaction[]): number => {
      return dailyTransactions.reduce((total, tx) => {
        if (tx.type === TransactionType.Income) {
            return total - tx.amount; // amount is negative, so this adds to the total
        }
        
        if (tx.type === TransactionType.Transfer) {
            const toCategory = getCategory(tx.toCategoryId!);
            // An expense is a transfer to an expense category
            if (toCategory && toCategory.type === CategoryType.Expenses) {
                return total - tx.amount;
            }
        }
        // Regular transfers between non-expense accounts don't affect the total.
        return total; 
      }, 0);
    };

    return (
        <div className="max-w-md mx-auto">
            <header className="p-4 flex justify-between items-center sticky top-0 bg-background z-20 border-b border-border">
                <h1 className="text-2xl font-bold text-text-primary">История</h1>
                <div className="flex items-center gap-2">
                    <div className="relative" ref={sortRef}>
                        <button 
                            onClick={toggleSort}
                            className="p-2 rounded-lg bg-card hover:bg-border text-text-secondary hover:text-text-primary transition-colors"
                        >
                            <ArrowDownUp size={20} />
                        </button>
                        {showSortOptions && (
                            <div className="absolute top-full right-0 mt-2 w-56 rounded-lg bg-card shadow-xl ring-1 ring-border z-30 p-2 animate-scale-in">
                                <h3 className="text-sm font-semibold text-text-secondary px-2 py-1">Сортировка</h3>
                                <div className="space-y-1">
                                    {SORT_OPTIONS.map(({key, label}) => (
                                        <button key={key} onClick={() => { setSortOption(key); setShowSortOptions(false); }}
                                            className="w-full text-left p-2 rounded-md flex justify-between items-center hover:bg-background transition-colors text-sm font-medium"
                                        >
                                            <span>{label}</span>
                                            {sortOption === key && <Check size={16} className="text-accent" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="relative" ref={filtersRef}>
                        <button 
                            onClick={toggleFilters}
                            className="relative p-2 rounded-lg bg-card hover:bg-border text-text-secondary hover:text-text-primary transition-colors"
                            aria-expanded={showFilters}
                            aria-controls="filter-panel"
                        >
                            <Filter size={20} />
                            {activeFilterCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-accent text-accent-text text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>
                        {showFilters && (
                            <div id="filter-panel" className="absolute top-full right-0 mt-2 w-[320px] rounded-lg bg-card shadow-xl z-30 animate-scale-in ring-1 ring-border">
                                <div className="flex justify-between items-center p-3 border-b border-border">
                                    <h2 className="text-md font-bold">Фильтры</h2>
                                    <button onClick={() => setShowFilters(false)} className="p-1 rounded-full hover:bg-border"><X size={20} /></button>
                                </div>
                                <div className="p-4 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-text-secondary mb-1">От</label>
                                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-background border border-border rounded-lg p-2 text-text-primary focus:ring-2 focus:ring-accent outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-text-secondary mb-1">До</label>
                                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-background border border-border rounded-lg p-2 text-text-primary focus:ring-2 focus:ring-accent outline-none" />
                                        </div>
                                    </div>
                                     <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Категории</label>
                                        <select multiple value={selectedCategories} onChange={handleMultiSelect(setSelectedCategories)} className="w-full bg-background border border-border rounded-lg p-2 text-text-primary focus:ring-2 focus:ring-accent outline-none h-32">
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                     <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Участники</label>
                                        <select multiple value={selectedParticipants} onChange={handleMultiSelect(setSelectedParticipants)} className="w-full bg-background border border-border rounded-lg p-2 text-text-primary focus:ring-2 focus:ring-accent outline-none h-24">
                                            {participants.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 p-3 bg-background/50 rounded-b-lg border-t border-border">
                                     <button onClick={handleResetFilters} className="px-4 py-1.5 rounded-md text-sm font-semibold bg-background hover:bg-border border border-border">Сбросить</button>
                                     <button onClick={() => setShowFilters(false)} className="px-5 py-1.5 rounded-md text-sm font-semibold bg-accent text-accent-text">Применить</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>
            
            <main className="p-4">
                {Array.isArray(processedTransactions) ? (
                    processedTransactions.length > 0 ? (
                        <ul className="space-y-3">{processedTransactions.map(renderTransactionItem)}</ul>
                    ) : (
                        <p className="text-text-secondary text-center mt-8">Транзакции не найдены.</p>
                    )
                ) : (
                    Object.keys(processedTransactions).length > 0 ? (
                        Object.entries(processedTransactions).map(([date, txs]) => {
                            const dailyTotal = calculateDailyTotal(txs);
                            const totalColor = dailyTotal > 0 ? 'text-green-500' : dailyTotal < 0 ? 'text-red-500' : 'text-text-secondary';
                            return (
                                <div key={date} className="mb-6">
                                    <div className="sticky top-[73px] bg-background z-10 py-2 flex justify-between items-center">
                                        <h2 className="font-bold text-text-primary">{formatDateGroup(date)}</h2>
                                        <p className={`font-semibold text-sm ${totalColor}`}>
                                            {dailyTotal > 0 ? '+' : ''}
                                            {new Intl.NumberFormat('ru-RU').format(dailyTotal)} ₽
                                        </p>
                                    </div>
                                    <ul className="space-y-3">{txs.map(renderTransactionItem)}</ul>
                                </div>
                            );
                        })
                    ) : (
                       <p className="text-text-secondary text-center mt-8">Транзакции не найдены.</p>
                    )
                )}
            </main>
        </div>
    );
};

export default HistoryPage;
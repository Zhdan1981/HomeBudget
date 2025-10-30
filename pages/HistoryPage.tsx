
import React from 'react';
import { useBudget } from '../hooks/useBudget';
import { TransactionType } from '../types';

const HistoryPage: React.FC = () => {
    const { state } = useBudget();
    const { transactions, categories } = state;

    const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || 'Неизвестно';

    const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="p-4 max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-text-primary">История транзакций</h1>
            {sortedTransactions.length === 0 ? (
                <p className="text-text-secondary text-center mt-8">История пока пуста.</p>
            ) : (
                <ul className="space-y-3">
                    {sortedTransactions.map(tx => {
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
                                        {new Date(tx.date).toLocaleString('ru-RU')}
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


import React, { useState, useEffect } from 'react';
import { Category, TransactionType, Participant } from '../types';
import { useBudget } from '../hooks/useBudget';
import { X } from 'lucide-react';

interface AddTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    category: Category | null;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose, category }) => {
    const { state, dispatch } = useBudget();
    const [amountStr, setAmountStr] = useState('');
    const [type, setType] = useState<TransactionType>(TransactionType.Expense);
    const [participant, setParticipant] = useState<Participant>(Participant.Me);
    const [note, setNote] = useState('');
    const [toCategoryId, setToCategoryId] = useState<string>('');

    useEffect(() => {
        if (isOpen) {
            setAmountStr('');
            setType(TransactionType.Expense);
            setParticipant(Participant.Me);
            setNote('');
            setToCategoryId('');
        }
    }, [isOpen]);

    if (!isOpen || !category) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const amounts = amountStr.match(/[\d\.]+/g)?.map(Number) || [0];
        const totalAmount = amounts.reduce((sum, val) => sum + val, 0);
        
        if (totalAmount <= 0) return;

        const amountToStore = type === TransactionType.Income ? -totalAmount : totalAmount;

        const newTransaction = {
            id: new Date().toISOString(),
            categoryId: category.id,
            amount: amountToStore,
            type,
            participant,
            note,
            date: new Date().toISOString(),
            ...(type === TransactionType.Transfer && { toCategoryId }),
        };

        dispatch({ type: 'ADD_TRANSACTION', payload: newTransaction });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-end sm:items-center z-50" onClick={onClose}>
            <div className="bg-card w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-6" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-text-primary">Новая транзакция в "{category.name}"</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-text-secondary hover:bg-border hover:text-text-primary">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Сумма</label>
                        <input
                            type="text"
                            value={amountStr}
                            onChange={(e) => setAmountStr(e.target.value)}
                            placeholder="500 или 100,50 + 200"
                            className="w-full bg-background border border-border rounded-lg p-3 text-text-primary focus:ring-2 focus:ring-accent focus:border-accent outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Тип</label>
                        <div className="flex gap-2">
                            {Object.values(TransactionType).map(t => (
                                <button type="button" key={t} onClick={() => setType(t)} className={`px-4 py-2 rounded-lg text-sm font-semibold flex-1 ${type === t ? 'bg-accent text-accent-text' : 'bg-background hover:bg-border'}`}>
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                    {type === TransactionType.Transfer && (
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Куда</label>
                            <select value={toCategoryId} onChange={(e) => setToCategoryId(e.target.value)} required className="w-full bg-background border border-border rounded-lg p-3 text-text-primary focus:ring-2 focus:ring-accent focus:border-accent outline-none">
                                <option value="" disabled>Выберите счет</option>
                                {state.categories.filter(c => c.id !== category.id).map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Участник</label>
                        <div className="flex gap-2 flex-wrap">
                            {Object.values(Participant).map(p => (
                                <button type="button" key={p} onClick={() => setParticipant(p)} className={`px-4 py-2 rounded-lg text-sm font-semibold ${participant === p ? 'bg-accent text-accent-text' : 'bg-background hover:bg-border'}`}>
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Заметка</label>
                        <input
                            type="text"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Например, продукты на неделю"
                            className="w-full bg-background border border-border rounded-lg p-3 text-text-primary focus:ring-2 focus:ring-accent focus:border-accent outline-none"
                        />
                    </div>
                    <button type="submit" className="w-full bg-accent text-accent-text font-bold py-3 rounded-lg hover:opacity-90 transition-opacity">
                        Добавить
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddTransactionModal;

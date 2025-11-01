import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Category, TransactionType } from '../types';
import { useBudget } from '../hooks/useBudget';
import { ArrowLeft, ChevronDown, X, Plus } from 'lucide-react';

interface TransactionFormState {
    id: number;
    amountStr: string;
    note: string;
}

const CategoryTransactionPage: React.FC = () => {
    const { id: categoryId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { state, dispatch } = useBudget();
    
    const category = state.categories.find(c => c.id === categoryId);

    const [type, setType] = useState<TransactionType>(TransactionType.Expense);
    const [transferFromId, setTransferFromId] = useState<string>('');
    const [transferToId, setTransferToId] = useState<string>('');
    const [incomeToId, setIncomeToId] = useState<string>('');
    
    const [isEditingBalance, setIsEditingBalance] = useState(false);
    const [editedBalanceStr, setEditedBalanceStr] = useState('');

    const [transactionForms, setTransactionForms] = useState<TransactionFormState[]>([
        { id: Date.now(), amountStr: '', note: '' }
    ]);

    useEffect(() => {
        if (category) {
            const firstOtherCategory = state.categories.find(c => c.id !== categoryId);
            setTransferToId(firstOtherCategory?.id || (state.categories.length > 0 ? state.categories[0].id : ''));
            setIncomeToId(category.id);
            setTransferFromId(category.id);
        }
    }, [category, categoryId, state.categories]);
    
    const addTransactionForm = () => {
        setTransactionForms([...transactionForms, { id: Date.now(), amountStr: '', note: '' }]);
    };

    const removeTransactionForm = (id: number) => {
        setTransactionForms(transactionForms.filter(form => form.id !== id));
    };

    const handleFormChange = (id: number, field: keyof Omit<TransactionFormState, 'id'>, value: string) => {
        setTransactionForms(forms => 
            forms.map(form => form.id === id ? { ...form, [field]: value } : form)
        );
    };

    if (!category) {
        return (
            <div className="bg-background text-text-primary min-h-screen flex flex-col items-center justify-center">
                <p className="text-lg">Категория не найдена.</p>
                <button onClick={() => navigate('/')} className="mt-4 px-4 py-2 bg-accent text-accent-text rounded-lg">
                    Назад
                </button>
            </div>
        );
    }
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const baseTransactionInfo = {
            idPrefix: new Date().toISOString(),
            date: new Date().toISOString(),
        };

        transactionForms.forEach(form => {
            const amount = parseFloat(form.amountStr.replace(',', '.'));
            if (isNaN(amount) || amount <= 0) return;

            let newTransaction;
            const transactionDetails = {
                id: `${baseTransactionInfo.idPrefix}-${form.id}`,
                date: baseTransactionInfo.date,
                note: form.note,
            };

            switch (type) {
                case TransactionType.Expense:
                    newTransaction = { 
                        ...transactionDetails, 
                        categoryId: category.id, 
                        amount, 
                        type: TransactionType.Expense 
                    };
                    break;
                case TransactionType.Income:
                    newTransaction = { ...transactionDetails, categoryId: incomeToId, amount: -amount, type };
                    break;
                case TransactionType.Transfer:
                    if (transferFromId === transferToId) return;
                    newTransaction = { ...transactionDetails, categoryId: transferFromId, toCategoryId: transferToId, amount, type };
                    break;
                default:
                    return;
            }

            if(newTransaction) {
              dispatch({ type: 'ADD_TRANSACTION', payload: newTransaction });
            }
        });
        
        navigate(-1);
    };

    const handleBalanceClick = () => {
        setIsEditingBalance(true);
        setEditedBalanceStr(category.balance.toString().replace('.', ','));
    };

    const handleBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditedBalanceStr(e.target.value);
    };
    
    const handleBalanceUpdate = () => {
        const newBalance = parseFloat(editedBalanceStr.replace(',', '.'));
        if (!isNaN(newBalance) && newBalance !== category.balance) {
            dispatch({
                type: 'UPDATE_CATEGORY_BALANCE',
                payload: { categoryId: category.id, balance: newBalance }
            });
        }
        setIsEditingBalance(false);
    };

    const handleBalanceKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleBalanceUpdate();
        } else if (e.key === 'Escape') {
            setIsEditingBalance(false);
        }
    };
    
    const formattedBalance = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(category.balance);

    const SelectWrapper: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
        <div className={`relative ${className}`}>
            {children}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-text-secondary">
                <ChevronDown size={20} />
            </div>
        </div>
    );

    return (
      <div className="bg-background text-text-primary min-h-screen font-sans flex flex-col" style={{ backgroundColor: 'var(--background)' }}>
        <header className="p-4 flex justify-between items-center text-text-primary shrink-0">
            <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-full hover:bg-card">
                <ArrowLeft size={24} />
            </button>
            <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${category.color.replace('text-','bg-')}`}></span>
                <span className="font-bold text-lg">{category.name}</span>
            </div>
            <div className="w-8 h-8" /> 
        </header>

        <section className="text-center py-4 shrink-0">
            {isEditingBalance ? (
                <input
                    type="text"
                    inputMode="decimal"
                    value={editedBalanceStr}
                    onChange={handleBalanceChange}
                    onBlur={handleBalanceUpdate}
                    onKeyDown={handleBalanceKeyDown}
                    autoFocus
                    className="text-5xl font-bold tracking-tight bg-transparent text-center w-full outline-none border-b-2 border-accent text-text-primary"
                    style={{ caretColor: 'var(--accent)' }}
                />
            ) : (
                <h1 onClick={handleBalanceClick} className="text-5xl font-bold tracking-tight cursor-pointer">
                    {formattedBalance}
                </h1>
            )}
        </section>

        <main className="flex-grow p-4 overflow-y-auto">
          <form id="transaction-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Тип операции</label>
              <SelectWrapper>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as TransactionType)}
                    className="w-full bg-card border border-border rounded-lg p-3 text-text-primary focus:ring-2 focus:ring-accent focus:border-accent outline-none appearance-none pr-10"
                  >
                    <option value={TransactionType.Expense}>Расход</option>
                    <option value={TransactionType.Income}>Доход</option>
                    <option value={TransactionType.Transfer}>Перевод</option>
                  </select>
              </SelectWrapper>
            </div>
            
            <div className="space-y-4">
                {transactionForms.map((form, index) => (
                    <div key={form.id} className="bg-card p-4 rounded-lg space-y-4 border border-border relative">
                        <div className="flex justify-between items-center">
                           <p className="text-sm font-semibold text-text-secondary">Транзакция {index + 1}</p>
                           {transactionForms.length > 1 && (
                               <button type="button" onClick={() => removeTransactionForm(form.id)} className="p-1 -mr-2 -mt-2 rounded-full text-text-secondary hover:bg-background hover:text-text-primary">
                                   <X size={18} />
                               </button>
                           )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-secondary mb-1">Сумма</label>
                          <input
                            type="text" inputMode="decimal" value={form.amountStr}
                            onChange={(e) => handleFormChange(form.id, 'amountStr', e.target.value)}
                            placeholder="0,00"
                            className="w-full bg-background border border-border rounded-lg p-3 text-text-primary focus:ring-2 focus:ring-accent focus:border-accent outline-none"
                            required
                          />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-text-secondary mb-1">Описание (необязательно)</label>
                           <input
                            type="text" value={form.note}
                            onChange={(e) => handleFormChange(form.id, 'note', e.target.value)}
                            className="w-full bg-background border border-border rounded-lg p-3 text-text-primary focus:ring-2 focus:ring-accent focus:border-accent outline-none"
                          />
                        </div>
                    </div>
                ))}
            </div>

            {type === TransactionType.Transfer && (
                <div className="bg-card p-4 rounded-lg space-y-4 border border-border">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Откуда</label>
                        <div className="w-full bg-background border border-border rounded-lg p-3 text-text-secondary">
                            {category.name}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Куда</label>
                        <SelectWrapper>
                            <select value={transferToId} onChange={(e) => setTransferToId(e.target.value)} required className="w-full bg-background border border-border rounded-lg p-3 text-text-primary focus:ring-2 focus:ring-accent focus:border-accent outline-none appearance-none pr-10">
                                {state.categories.filter(c => c.id !== category.id).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </SelectWrapper>
                    </div>
                </div>
            )}
            
            <button
                type="button"
                onClick={addTransactionForm}
                className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg py-3 text-text-secondary hover:bg-card hover:border-accent transition-colors"
            >
                <Plus size={20} />
                Добавить еще транзакцию
            </button>
          </form>
        </main>

        <footer className="p-4 grid grid-cols-2 gap-4 shrink-0">
            <button type="submit" form="transaction-form" className="bg-accent text-accent-text font-bold py-3 rounded-lg hover:opacity-90 transition-opacity">
                 Добавить {transactionForms.length > 1 ? `(${transactionForms.length})` : ''}
            </button>
             <button type="button" onClick={() => navigate('/')} className="bg-card text-text-primary font-bold py-3 rounded-lg hover:bg-border transition-colors border border-border">
                Закрыть
            </button>
        </footer>
      </div>
    );
};

export default CategoryTransactionPage;
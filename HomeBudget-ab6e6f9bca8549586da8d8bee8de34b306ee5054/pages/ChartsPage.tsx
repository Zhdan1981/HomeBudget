
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useBudget } from '../hooks/useBudget';
import { TransactionType } from '../types';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943', '#19FFD1'];

const ChartsPage: React.FC = () => {
    const { state } = useBudget();
    const { transactions, categories, categories: allCategories } = state;

    const expenseData = useMemo(() => {
        const expensesByCategory: { [key: string]: number } = {};
        transactions
            .filter(tx => tx.type === TransactionType.Expense)
            .forEach(tx => {
                const categoryName = categories.find(c => c.id === tx.categoryId)?.name || 'Прочее';
                if (!expensesByCategory[categoryName]) {
                    expensesByCategory[categoryName] = 0;
                }
                expensesByCategory[categoryName] += tx.amount;
            });
        
        return Object.entries(expensesByCategory)
            .map(([name, value]) => ({ name, value }))
            .filter(item => item.value > 0)
            .sort((a,b) => b.value - a.value);

    }, [transactions, categories]);
    
    const balanceHistoryData = useMemo(() => {
        const data: { date: string; balance: number }[] = [];
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const initialBalance = allCategories.reduce((sum, cat) => sum + cat.balance, 0) + transactions.reduce((sum, tx) => sum + tx.amount, 0);
        let currentBalance = initialBalance;
        
        const relevantTransactions = transactions
            .filter(tx => new Date(tx.date) >= thirtyDaysAgo)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const dailyBalances: { [key: string]: number } = {};

        for (let i = 0; i < 30; i++) {
            const date = new Date();
            date.setDate(date.getDate() - (29 - i));
            const dateString = date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit'});
            dailyBalances[dateString] = 0; // Initialize
        }
        
        const firstDayString = thirtyDaysAgo.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit'});
        dailyBalances[firstDayString] = initialBalance;


        for (const tx of relevantTransactions) {
            currentBalance -= tx.amount;
            const txDateString = new Date(tx.date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit'});
            if(dailyBalances[txDateString] !== undefined){
                 dailyBalances[txDateString] = currentBalance;
            }
        }
        
        let lastKnownBalance = initialBalance;
        return Object.entries(dailyBalances).map(([date, balance]) => {
            if (balance === 0) { // If no transactions that day, use last known balance
                 return { date, balance: lastKnownBalance };
            }
            lastKnownBalance = balance;
            return { date, balance };
        });

    }, [transactions, allCategories]);

    return (
        <div className="p-4 max-w-md mx-auto text-text-primary">
            <h1 className="text-2xl font-bold mb-6">Графики</h1>
            
            <div className="bg-card p-4 rounded-lg mb-6">
                <h2 className="text-lg font-semibold mb-4">Расходы по категориям</h2>
                {expenseData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={expenseData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                                {expenseData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => `${value.toFixed(2)} ₽`} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <p className="text-text-secondary text-center py-10">Нет данных о расходах.</p>
                )}
            </div>

            <div className="bg-card p-4 rounded-lg">
                <h2 className="text-lg font-semibold mb-4">Динамика баланса (30 дней)</h2>
                 {balanceHistoryData.length > 1 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={balanceHistoryData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="date" stroke="var(--text-secondary)" />
                            <YAxis stroke="var(--text-secondary)" tickFormatter={(value) => `${(value/1000).toFixed(0)}k`} />
                            <Tooltip formatter={(value: number) => `${value.toFixed(2)} ₽`} />
                            <Legend />
                            <Line type="monotone" dataKey="balance" name="Общий баланс" stroke="var(--accent)" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                 ) : (
                    <p className="text-text-secondary text-center py-10">Недостаточно данных для графика.</p>
                 )}
            </div>
        </div>
    );
};

export default ChartsPage;

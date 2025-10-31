import React, { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useBudget } from '../hooks/useBudget';
import { TransactionType } from '../types';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943', '#19FFD1'];

type TimeRange = 'week' | 'month' | 'year' | 'all';
const TIME_RANGE_OPTIONS: { key: TimeRange; label: string }[] = [
    { key: 'week', label: 'Неделя' },
    { key: 'month', label: 'Месяц' },
    { key: 'year', label: 'Год' },
    { key: 'all', label: 'Все время' },
];

const StatCard: React.FC<{ title: string; value: number; colorClass: string }> = ({ title, value, colorClass }) => (
    <div className="bg-background p-3 rounded-lg flex-1 text-center sm:text-left">
        <p className="text-xs sm:text-sm text-text-secondary">{title}</p>
        <p className={`text-xl sm:text-2xl font-bold ${colorClass}`}>
            {new Intl.NumberFormat('ru-RU').format(value)}
            <span className="text-lg opacity-80 ml-1">₽</span>
        </p>
    </div>
);


const ChartsPage: React.FC = () => {
    const { state } = useBudget();
    const { transactions, categories: allCategories } = state;
    const [timeRange, setTimeRange] = useState<TimeRange>('month');

    const filteredTransactions = useMemo(() => {
        const now = new Date();
        if (timeRange === 'all') {
            return transactions;
        }

        let startDate = new Date();
        switch (timeRange) {
            case 'week':
                startDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(now.getMonth() - 1);
                break;
            case 'year':
                startDate.setFullYear(now.getFullYear() - 1);
                break;
        }
        return transactions.filter(tx => new Date(tx.date) >= startDate);
    }, [transactions, timeRange]);

    const financialOverview = useMemo(() => {
        const income = filteredTransactions
            .filter(tx => tx.type === TransactionType.Income)
            .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

        const expenses = filteredTransactions
            .filter(tx => tx.type === TransactionType.Expense)
            .reduce((sum, tx) => sum + tx.amount, 0);

        return { income, expenses, net: income - expenses };
    }, [filteredTransactions]);

    const expenseData = useMemo(() => {
        const expensesByCategory: { [key: string]: number } = {};
        filteredTransactions
            .filter(tx => tx.type === TransactionType.Expense)
            .forEach(tx => {
                const categoryName = allCategories.find(c => c.id === tx.categoryId)?.name || 'Прочее';
                if (!expensesByCategory[categoryName]) {
                    expensesByCategory[categoryName] = 0;
                }
                expensesByCategory[categoryName] += tx.amount;
            });
        
        return Object.entries(expensesByCategory)
            .map(([name, value]) => ({ name, value }))
            .filter(item => item.value > 0)
            .sort((a,b) => b.value - a.value);

    }, [filteredTransactions, allCategories]);
    
    const balanceHistoryData = useMemo(() => {
        const sortedTx = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        if (sortedTx.length === 0) return [];
    
        const totalCurrentBalance = allCategories.reduce((sum, cat) => sum + cat.balance, 0);
        const totalTransactionImpact = transactions.reduce((sum, tx) => sum + tx.amount, 0);
        const balanceBeforeAllTx = totalCurrentBalance + totalTransactionImpact;
    
        const balancePoints = [{ date: new Date(0), balance: balanceBeforeAllTx }];
        let runningBalance = balanceBeforeAllTx;
        for (const tx of sortedTx) {
            runningBalance -= tx.amount;
            balancePoints.push({ date: new Date(tx.date), balance: runningBalance });
        }
        balancePoints.push({ date: new Date(), balance: totalCurrentBalance });
    
        const now = new Date();
        let chartStartDate = new Date(balancePoints[1]?.date || now);
        if (timeRange !== 'all') {
            chartStartDate = new Date();
            switch (timeRange) {
                case 'week': chartStartDate.setDate(now.getDate() - 7); break;
                case 'month': chartStartDate.setMonth(now.getMonth() - 1); break;
                case 'year': chartStartDate.setFullYear(now.getFullYear() - 1); break;
            }
        }
        chartStartDate.setHours(0, 0, 0, 0);
    
        const startPoint = [...balancePoints].reverse().find(p => p.date <= chartStartDate) || balancePoints[0];
        const relevantPoints = balancePoints.filter(p => p.date >= chartStartDate);
    
        const dataMap = new Map<string, number>();
        dataMap.set(chartStartDate.toISOString().split('T')[0], startPoint.balance);
        relevantPoints.forEach(p => {
            dataMap.set(p.date.toISOString().split('T')[0], p.balance);
        });
    
        const finalData: { date: Date, balance: number }[] = [];
        let dateCursor = new Date(chartStartDate);
        let lastKnownBalance = startPoint.balance;
    
        while (dateCursor <= now) {
            const key = dateCursor.toISOString().split('T')[0];
            if (dataMap.has(key)) {
                lastKnownBalance = dataMap.get(key)!;
            }
            finalData.push({ date: new Date(dateCursor), balance: lastKnownBalance });
            dateCursor.setDate(dateCursor.getDate() + 1);
        }
        
        if (timeRange === 'year' || timeRange === 'all') {
            const monthlyData = new Map<string, { balance: number; date: Date }>();
            finalData.forEach(p => {
                const key = p.date.toLocaleDateString('ru-RU', { year: 'numeric', month: 'short' });
                monthlyData.set(key, { balance: p.balance, date: p.date });
            });
            
            return Array.from(monthlyData.entries())
                .sort((a, b) => a[1].date.getTime() - b[1].date.getTime())
                .map(([key, value]) => ({ date: key, balance: value.balance }));
        }
    
        return finalData.map(p => ({
            date: p.date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
            balance: p.balance
        }));
    }, [transactions, allCategories, timeRange]);

    return (
        <div className="p-4 max-w-md mx-auto text-text-primary">
            <h1 className="text-2xl font-bold mb-4">Графики</h1>
            
            <div className="flex justify-center bg-card p-1 rounded-lg mb-6 shadow-sm">
                {TIME_RANGE_OPTIONS.map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => setTimeRange(key)}
                        className={`px-3 py-1.5 text-sm font-semibold rounded-md flex-1 transition-colors ${timeRange === key ? 'bg-accent text-accent-text' : 'text-text-secondary hover:bg-background'}`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <div className="bg-card p-4 rounded-lg mb-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-3">Финансовый обзор</h2>
                <div className="flex flex-col sm:flex-row gap-2">
                    <StatCard title="Доход" value={financialOverview.income} colorClass="text-green-500" />
                    <StatCard title="Расход" value={financialOverview.expenses} colorClass="text-red-500" />
                    <StatCard title="Чистый доход" value={financialOverview.net} colorClass={financialOverview.net >= 0 ? 'text-green-500' : 'text-red-500'} />
                </div>
            </div>
            
            <div className="bg-card p-4 rounded-lg mb-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Расходы по категориям</h2>
                {expenseData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            {/* FIX: The explicit type for the label prop was incorrect due to incomplete typings in the 'recharts' library. Switched to 'any' to resolve the TypeScript error. */}
                            <Pie data={expenseData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
                                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                const x = cx + (radius + 20) * Math.cos(-midAngle * Math.PI / 180);
                                const y = cy + (radius + 20) * Math.sin(-midAngle * Math.PI / 180);
                                const percentValue = (percent || 0) * 100;
                                if (percentValue < 5) return null; // Hide small labels
                                return (
                                <text x={x} y={y} fill="var(--text-primary)" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                                    {`${percentValue.toFixed(0)}%`}
                                </text>
                                );
                            }}>
                                {expenseData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => `${Number(value).toFixed(2)} ₽`} contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }} />
                            <Legend wrapperStyle={{ color: 'var(--text-secondary)' }}/>
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <p className="text-text-secondary text-center py-10">Нет данных о расходах за этот период.</p>
                )}
            </div>

            <div className="bg-card p-4 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Динамика баланса</h2>
                 {balanceHistoryData.length > 1 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={balanceHistoryData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={12} />
                            <YAxis stroke="var(--text-secondary)" fontSize={12} tickFormatter={(value) => `${(Number(value)/1000).toFixed(0)}k`} />
                            <Tooltip formatter={(value) => `${Number(value).toFixed(2)} ₽`} contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }} />
                            <Legend wrapperStyle={{ color: 'var(--text-secondary)' }}/>
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
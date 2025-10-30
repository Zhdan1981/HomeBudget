
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { BudgetProvider } from './context/BudgetContext';
import MainLayout from './layouts/MainLayout';
import BudgetPage from './pages/BudgetPage';
import HistoryPage from './pages/HistoryPage';
import ChartsPage from './pages/ChartsPage';

const App: React.FC = () => {
    return (
        <BudgetProvider>
            <HashRouter>
                <Routes>
                    <Route path="/" element={<MainLayout />}>
                        <Route index element={<BudgetPage />} />
                        <Route path="history" element={<HistoryPage />} />
                        <Route path="charts" element={<ChartsPage />} />
                    </Route>
                </Routes>
            </HashRouter>
        </BudgetProvider>
    );
};

export default App;

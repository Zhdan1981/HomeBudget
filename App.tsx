import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { BudgetProvider } from './context/BudgetContext';
import MainLayout from './layouts/MainLayout';
import BudgetPage from './pages/BudgetPage';
import HistoryPage from './pages/HistoryPage';
import ChartsPage from './pages/ChartsPage';
import CategoryTransactionPage from './components/AddTransactionModal';
import SettingsPage from './pages/SettingsPage';
import EditCategoryPage from './pages/EditCategoryPage';
import EditParticipantPage from './pages/EditParticipantPage';


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
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/category/:id" element={<CategoryTransactionPage />} />
                    <Route path="/settings/category/new" element={<EditCategoryPage />} />
                    <Route path="/settings/category/:id" element={<EditCategoryPage />} />
                    <Route path="/settings/participant/new" element={<EditParticipantPage />} />
                    <Route path="/settings/participant/:name" element={<EditParticipantPage />} />
                </Routes>
            </HashRouter>
        </BudgetProvider>
    );
};

export default App;

import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { useBudget } from '../hooks/useBudget';

const MainLayout: React.FC = () => {
    // This hook ensures the theme is applied as soon as the provider is ready
    const { state } = useBudget(); 

    return (
        <div className="bg-background text-text-primary min-h-screen font-sans flex flex-col">
            <main className="flex-grow pb-20">
                <Outlet />
            </main>
            <BottomNav />
        </div>
    );
};

export default MainLayout;

import React from 'react';
import { NavLink } from 'react-router-dom';
import { Wallet, History, BarChart3 } from 'lucide-react';
import { useBudget } from '../hooks/useBudget';

const BottomNav: React.FC = () => {
    const { state } = useBudget();

    const navItems = [
        { path: '/', label: 'Бюджет', icon: Wallet },
        { path: '/history', label: 'История', icon: History },
        { path: '/charts', label: 'Графики', icon: BarChart3 },
    ];

    const getLinkClass = ({ isActive }: { isActive: boolean }): string => {
        const baseClasses = 'flex flex-col items-center justify-center gap-1 text-xs transition-colors duration-200';
        return isActive ? `${baseClasses} text-accent` : `${baseClasses} text-text-secondary hover:text-text-primary`;
    };

    return (
        <nav 
            className="fixed bottom-4 inset-x-0 max-w-sm mx-auto h-16 border shadow-lg flex justify-around items-center z-50 rounded-2xl backdrop-blur-lg"
            style={{ 
                backgroundColor: `rgba(var(--card-rgb), ${state.bottomNavOpacity})`,
                borderColor: `rgba(var(--border-rgb), 0.5)` 
            }}
        >
            {navItems.map(item => (
                <NavLink key={item.path} to={item.path} className={getLinkClass}>
                    <item.icon className="w-6 h-6" />
                    <span>{item.label}</span>
                </NavLink>
            ))}
        </nav>
    );
};

export default BottomNav;
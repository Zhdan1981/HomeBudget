
import React from 'react';
import { Settings, Plus, SunMoon } from 'lucide-react';

interface HeaderProps {
    onThemeClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onThemeClick }) => {
    return (
        <header className="p-4 flex justify-between items-center text-text-secondary">
            <button className="p-2 hover:text-text-primary transition-colors">
                <Settings size={24} />
            </button>
            <div className="flex items-center gap-4">
                 <button className="p-2 hover:text-text-primary transition-colors">
                    <Plus size={28} />
                </button>
                <button onClick={onThemeClick} className="p-2 hover:text-text-primary transition-colors">
                    <SunMoon size={24} />
                </button>
            </div>
        </header>
    );
};

export default Header;

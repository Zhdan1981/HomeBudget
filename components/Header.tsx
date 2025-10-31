import React from 'react';
import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';

const Header: React.FC = () => {
    return (
        <header className="p-4 flex justify-end items-center text-text-secondary">
            <Link to="/settings" className="p-2 hover:text-text-primary transition-colors">
                <Settings size={24} />
            </Link>
        </header>
    );
};

export default Header;

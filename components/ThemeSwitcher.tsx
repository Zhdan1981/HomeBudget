
import React from 'react';
import { THEMES } from '../constants';
import { Theme } from '../types';
import { useBudget } from '../hooks/useBudget';

interface ThemeSwitcherProps {
    isOpen: boolean;
    onClose: () => void;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ isOpen, onClose }) => {
    const { state, dispatch } = useBudget();

    if (!isOpen) return null;

    const handleThemeSelect = (theme: Theme) => {
        dispatch({ type: 'SET_THEME', payload: theme });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={onClose}>
            <div className="bg-card rounded-lg p-6 w-11/12 max-w-md" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-4 text-text-primary">Выберите тему</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {THEMES.map(theme => (
                        <button
                            key={theme}
                            onClick={() => handleThemeSelect(theme)}
                            className={`p-3 rounded-lg text-center font-semibold transition-all duration-200 ${state.theme === theme ? 'bg-accent text-accent-text scale-105' : 'bg-background hover:bg-border'}`}
                        >
                            {theme}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ThemeSwitcher;

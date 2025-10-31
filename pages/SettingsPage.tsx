import React, { useRef, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBudget } from '../hooks/useBudget';
import { CategoryType } from '../types';
import { ICONS } from '../constants';
import { Plus, Pencil, Trash2, ChevronDown, Download, Upload, RefreshCw, SunMoon, ChevronRight, User, LogOut } from 'lucide-react';
import SubPageHeader from '../components/SubPageHeader';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { AuthContext } from '../context/AuthContext';

const SettingsPage: React.FC = () => {
    const { state, dispatch } = useBudget();
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const importInputRef = useRef<HTMLInputElement>(null);
    const [isThemeSwitcherOpen, setThemeSwitcherOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/auth');
    };

    const handleDeleteCategory = (categoryId: string, categoryName: string) => {
        if (window.confirm(`Вы уверены, что хотите удалить категорию "${categoryName}"? Все связанные транзакции также будут удалены.`)) {
            dispatch({ type: 'DELETE_CATEGORY', payload: categoryId });
        }
    };
    
    const handleDeleteParticipant = (name: string) => {
        if (name === 'Общие') {
            alert('Нельзя удалить основного участника "Общие".');
            return;
        }
        if (window.confirm(`Вы уверены, что хотите удалить участника "${name}"? Все его транзакции будут переназначены на "Общие".`)) {
            dispatch({ type: 'DELETE_PARTICIPANT', payload: name });
        }
    };

    const handleExport = () => {
        try {
            const { isDataLoaded, ...dataToExport } = state;
            const dataStr = JSON.stringify(dataToExport, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            const date = new Date().toISOString().split('T')[0];
            link.download = `home-budget-backup-${date}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to export data", error);
            alert("Произошла ошибка при экспорте данных.");
        }
    };

    const handleImportClick = () => {
        importInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') throw new Error("File content is not a string");
                const parsedState = JSON.parse(text);
                if (parsedState.categories && parsedState.transactions && parsedState.theme && parsedState.participants) {
                    if (window.confirm("Вы уверены, что хотите импортировать эти данные? Все текущие данные будут перезаписаны.")) {
                        dispatch({ type: 'SET_USER_DATA', payload: parsedState });
                        alert("Данные успешно импортированы.");
                    }
                } else {
                    throw new Error("Invalid state file format");
                }
            } catch (error) {
                console.error("Failed to import state:", error);
                alert("Не удалось импортировать данные. Файл поврежден или имеет неверный формат.");
            }
        };
        reader.readAsText(file);
        event.target.value = ''; 
    };
    
    const handleReset = () => {
        if (window.confirm("Вы уверены, что хотите сбросить все данные? Это действие необратимо.")) {
            if (window.confirm("ПОСЛЕДНЕЕ ПРЕДУПРЕЖДЕНИЕ: Все категории, участники и транзакции будут удалены.")) {
                dispatch({ type: 'RESET_STATE' });
                alert("Данные сброшены.");
            }
        }
    };

    const AccordionItem: React.FC<{ title: string, children: React.ReactNode, defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => (
        <details className="group bg-card rounded-lg shadow-sm overflow-hidden mb-4" open={defaultOpen}>
            <summary className="flex justify-between items-center p-4 cursor-pointer list-none">
                <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
                <ChevronDown className="w-5 h-5 text-text-secondary transition-transform duration-300 group-open:rotate-180" />
            </summary>
            <div className="px-4 pb-4 border-t border-border">
                {children}
            </div>
        </details>
    );

    return (
        <div className="bg-background text-text-primary min-h-screen font-sans">
            <SubPageHeader title="Настройки" onBack={() => navigate('/')} />
            <div className="p-4 max-w-md mx-auto">
                <AccordionItem title="Персонализация" defaultOpen={true}>
                    <div className="space-y-6 pt-2">
                        {/* Category Management */}
                        <div>
                             <h4 className="text-sm font-semibold text-text-secondary mb-2">Категории</h4>
                            <div className="space-y-4">
                                {Object.values(CategoryType).map(type => (
                                    <div key={type}>
                                        <h5 className="text-xs font-semibold text-text-secondary/80 mb-2 px-1">{type}</h5>
                                        <div className="bg-background rounded-md overflow-hidden border border-border">
                                            {state.categories.filter(c => c.type === type).map((category, index, arr) => {
                                                const Icon = ICONS[category.icon] || ICONS.Wallet;
                                                return (
                                                    <div key={category.id} className={`flex items-center p-3 gap-3 ${index < arr.length - 1 ? 'border-b border-border' : ''}`}>
                                                        <div className={`p-1.5 rounded-full ${category.color.replace('text-', 'bg-')}/20 ${category.color}`}>
                                                            <Icon className="w-5 h-5" />
                                                        </div>
                                                        <span className="flex-grow font-medium text-sm">{category.name}</span>
                                                        <button onClick={() => navigate(`/settings/category/${category.id}`)} className="p-2 text-text-secondary hover:text-text-primary rounded-full hover:bg-border transition-colors">
                                                            <Pencil size={18} />
                                                        </button>
                                                        <button onClick={() => handleDeleteCategory(category.id, category.name)} className="p-2 text-text-secondary hover:text-red-500 rounded-full hover:bg-border transition-colors">
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button 
                                onClick={() => navigate('/settings/category/new')}
                                className="w-full mt-3 flex items-center justify-center gap-2 bg-background border-2 border-dashed border-border text-text-secondary font-semibold py-2 rounded-lg hover:border-accent hover:text-accent transition-colors text-sm"
                            >
                                <Plus size={18} />
                                <span>Добавить категорию</span>
                            </button>
                        </div>
                        {/* Participant Management */}
                        <div>
                            <h4 className="text-sm font-semibold text-text-secondary mb-2">Участники</h4>
                             <div className="bg-background rounded-md overflow-hidden border border-border">
                                {state.participants.map((participant, index) => (
                                     <div key={participant} className={`flex items-center p-3 gap-3 ${index < state.participants.length - 1 ? 'border-b border-border' : ''}`}>
                                        <div className={`p-1.5 rounded-full bg-background text-text-secondary`}>
                                            <User size={18} />
                                        </div>
                                        <span className="flex-grow font-medium text-sm">{participant}</span>
                                        <button onClick={() => navigate(`/settings/participant/${participant}`)} className="p-2 text-text-secondary hover:text-text-primary rounded-full hover:bg-border transition-colors">
                                            <Pencil size={18} />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteParticipant(participant)} 
                                            className="p-2 text-text-secondary hover:text-red-500 rounded-full hover:bg-border transition-colors disabled:opacity-30 disabled:hover:text-text-secondary" 
                                            disabled={participant === 'Общие'}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button 
                                onClick={() => navigate('/settings/participant/new')}
                                className="w-full mt-3 flex items-center justify-center gap-2 bg-background border-2 border-dashed border-border text-text-secondary font-semibold py-2 rounded-lg hover:border-accent hover:text-accent transition-colors text-sm"
                            >
                                <Plus size={18} />
                                <span>Добавить участника</span>
                            </button>
                        </div>
                    </div>
                </AccordionItem>
                 <AccordionItem title="Оформление">
                    <div className="pt-2">
                        <div className="bg-background rounded-md overflow-hidden border border-border">
                            <button
                                onClick={() => setThemeSwitcherOpen(true)}
                                className="flex items-center p-3 gap-3 w-full text-left hover:bg-border transition-colors"
                            >
                                <div className={`p-1.5 rounded-full bg-accent/20 text-accent`}>
                                    <SunMoon size={18} />
                                </div>
                                <span className="flex-grow font-medium text-sm">Тема</span>
                                <span className="text-sm text-text-secondary mr-2">{state.theme}</span>
                                <ChevronRight size={18} className="text-text-secondary" />
                            </button>
                        </div>
                    </div>
                </AccordionItem>
                <AccordionItem title="Управление данными">
                    <div className="space-y-3 pt-2">
                         <button onClick={handleExport} className="w-full flex items-center justify-center gap-3 bg-background border border-border text-text-primary font-semibold py-3 rounded-lg hover:bg-border transition-colors">
                            <Download size={20} />
                            <span>Экспорт данных</span>
                        </button>
                        <button onClick={handleImportClick} className="w-full flex items-center justify-center gap-3 bg-background border border-border text-text-primary font-semibold py-3 rounded-lg hover:bg-border transition-colors">
                            <Upload size={20} />
                            <span>Импорт данных</span>
                        </button>
                        <input type="file" ref={importInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
                        <button onClick={handleReset} className="w-full flex items-center justify-center gap-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 font-semibold py-3 rounded-lg hover:bg-yellow-500/20 transition-colors">
                            <RefreshCw size={20} />
                            <span>Сброс данных</span>
                        </button>
                    </div>
                </AccordionItem>

                 <div className="mt-8">
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 bg-red-500/10 border border-red-500/20 text-red-500 font-semibold py-3 rounded-lg hover:bg-red-500/20 transition-colors">
                        <LogOut size={20} />
                        <span>Выйти</span>
                    </button>
                </div>

            </div>
            <ThemeSwitcher 
                isOpen={isThemeSwitcherOpen} 
                onClose={() => setThemeSwitcherOpen(false)}
            />
        </div>
    );
};

export default SettingsPage;
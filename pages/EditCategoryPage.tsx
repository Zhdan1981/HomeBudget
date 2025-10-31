import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBudget } from '../hooks/useBudget';
import { Category, CategoryType } from '../types';
import { ICONS, CATEGORY_COLORS } from '../constants';
import SubPageHeader from '../components/SubPageHeader';

const EditCategoryPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { state, dispatch } = useBudget();
    
    const isEditing = id !== 'new' && id !== undefined;
    
    const [categoryData, setCategoryData] = useState<Partial<Category>>({
        name: '',
        type: CategoryType.Expenses,
        icon: 'Wallet',
        color: CATEGORY_COLORS[0],
        balance: 0,
    });
    
    useEffect(() => {
        if (isEditing) {
            const existingCategory = state.categories.find(c => c.id === id);
            if (existingCategory) {
                setCategoryData(existingCategory);
            } else {
                navigate('/settings'); // Category not found, redirect
            }
        }
    }, [id, isEditing, state.categories, navigate]);
    
    const handleChange = (field: keyof Category, value: any) => {
        setCategoryData(prev => ({ ...prev, [field]: value }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!categoryData.name || !categoryData.type || !categoryData.icon || !categoryData.color) {
            alert('Пожалуйста, заполните все поля.');
            return;
        }

        if (isEditing) {
            dispatch({ type: 'UPDATE_CATEGORY', payload: categoryData as Category });
        } else {
            const newCategory: Category = {
                id: new Date().toISOString(),
                name: categoryData.name,
                type: categoryData.type,
                icon: categoryData.icon,
                color: categoryData.color,
                balance: categoryData.balance || 0,
            };
            dispatch({ type: 'ADD_CATEGORY', payload: newCategory });
        }
        navigate('/settings', { replace: true });
    };
    
    return (
        <div className="bg-background text-text-primary min-h-screen font-sans flex flex-col">
            <SubPageHeader title={isEditing ? 'Редактировать категорию' : 'Новая категория'} />
            
            <main className="flex-grow p-4 overflow-y-auto">
                <form id="category-form" onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Название</label>
                        <input
                            type="text"
                            value={categoryData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            className="w-full bg-card border border-border rounded-lg p-3 text-text-primary focus:ring-2 focus:ring-accent outline-none"
                            required
                        />
                    </div>
                    
                    {!isEditing && (
                         <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Начальный баланс</label>
                            <input
                                type="number"
                                step="0.01"
                                value={categoryData.balance}
                                onChange={(e) => handleChange('balance', parseFloat(e.target.value) || 0)}
                                placeholder="0"
                                className="w-full bg-card border border-border rounded-lg p-3 text-text-primary focus:ring-2 focus:ring-accent outline-none"
                            />
                        </div>
                    )}
                    
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Тип</label>
                        <div className="flex gap-2 bg-card p-1 rounded-lg">
                            {Object.values(CategoryType).map(t => (
                                <button type="button" key={t} onClick={() => handleChange('type', t)} className={`px-4 py-2 rounded-md text-sm font-semibold flex-1 transition-colors ${categoryData.type === t ? 'bg-accent text-accent-text' : 'text-text-secondary hover:bg-background'}`}>
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Иконка</label>
                        <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 bg-card p-3 rounded-lg">
                            {Object.keys(ICONS).map(iconKey => {
                                const Icon = ICONS[iconKey];
                                return (
                                    <button
                                        type="button"
                                        key={iconKey}
                                        onClick={() => handleChange('icon', iconKey)}
                                        className={`p-3 rounded-lg flex justify-center items-center transition-all ${categoryData.icon === iconKey ? 'bg-accent text-accent-text scale-110' : 'bg-background hover:bg-border'}`}
                                    >
                                        <Icon className="w-6 h-6" />
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    
                     <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Цвет</label>
                        <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 bg-card p-3 rounded-lg">
                            {CATEGORY_COLORS.map(color => (
                                <button
                                    type="button"
                                    key={color}
                                    onClick={() => handleChange('color', color)}
                                    className={`w-10 h-10 rounded-full flex justify-center items-center transition-all ${categoryData.color === color ? 'ring-2 ring-offset-2 ring-offset-card ring-accent' : ''}`}
                                >
                                   <span className={`w-8 h-8 rounded-full ${color.replace('text-', 'bg-')}`}></span>
                                </button>
                            ))}
                        </div>
                    </div>

                </form>
            </main>
            
            <footer className="p-4 shrink-0">
                <button type="submit" form="category-form" className="w-full bg-accent text-accent-text font-bold py-3 rounded-lg hover:opacity-90 transition-opacity">
                    Сохранить
                </button>
            </footer>
        </div>
    );
};

export default EditCategoryPage;

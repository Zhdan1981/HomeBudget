import React, { createContext, useReducer, useEffect, ReactNode, Dispatch } from 'react';
import { Category, Transaction, Theme } from '../types';
import { INITIAL_CATEGORIES, THEMES } from '../constants';

interface AppState {
    categories: Category[];
    transactions: Transaction[];
    theme: Theme;
}

type Action =
    | { type: 'ADD_TRANSACTION'; payload: Transaction }
    | { type: 'SET_THEME'; payload: Theme }
    | { type: 'SET_STATE'; payload: AppState }
    | { type: 'REORDER_CATEGORIES'; payload: Category[] }
    | { type: 'UPDATE_CATEGORY_BALANCE'; payload: { categoryId: string; balance: number } };

const initialState: AppState = {
    categories: INITIAL_CATEGORIES,
    transactions: [],
    theme: 'Полночь',
};

const budgetReducer = (state: AppState, action: Action): AppState => {
    switch (action.type) {
        case 'ADD_TRANSACTION': {
            const transaction = action.payload;
            const newTransactions = [...state.transactions, transaction];
            const newCategories = state.categories.map(cat => {
                if (cat.id === transaction.categoryId) {
                    return { ...cat, balance: cat.balance - transaction.amount };
                }
                if (transaction.type === 'Перевод' && cat.id === transaction.toCategoryId) {
                    return { ...cat, balance: cat.balance + transaction.amount };
                }
                return cat;
            });
            return { ...state, transactions: newTransactions, categories: newCategories };
        }
        case 'SET_THEME':
            return { ...state, theme: action.payload };
        case 'SET_STATE':
            return action.payload;
        case 'REORDER_CATEGORIES':
            return { ...state, categories: action.payload };
        case 'UPDATE_CATEGORY_BALANCE':
            return {
                ...state,
                categories: state.categories.map(cat =>
                    cat.id === action.payload.categoryId
                        ? { ...cat, balance: action.payload.balance }
                        : cat
                ),
            };
        default:
            return state;
    }
};

export const BudgetContext = createContext<{
    state: AppState;
    dispatch: Dispatch<Action>;
}>({
    state: initialState,
    dispatch: () => null,
});

export const BudgetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(budgetReducer, initialState);

    useEffect(() => {
        try {
            const storedState = localStorage.getItem('budgetAppState');
            if (storedState) {
                const parsedState = JSON.parse(storedState);
                // Ensure all initial categories are present
                const categoryIds = new Set(parsedState.categories.map((c: Category) => c.id));
                const missingCategories = INITIAL_CATEGORIES.filter(c => !categoryIds.has(c.id));
                if (missingCategories.length > 0) {
                  parsedState.categories.push(...missingCategories);
                }
                dispatch({ type: 'SET_STATE', payload: parsedState });
            }
        } catch (error) {
            console.error("Failed to load state from localStorage", error);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem('budgetAppState', JSON.stringify(state));
            document.documentElement.setAttribute('data-theme', state.theme);
        } catch (error) {
            console.error("Failed to save state to localStorage", error);
        }
    }, [state]);

    return (
        <BudgetContext.Provider value={{ state, dispatch }}>
            {children}
        </BudgetContext.Provider>
    );
};
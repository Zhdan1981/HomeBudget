import React, { createContext, useReducer, useEffect, ReactNode, Dispatch } from 'react';
import { Category, Transaction, Theme } from '../types';
import { INITIAL_CATEGORIES, INITIAL_PARTICIPANTS } from '../constants';

interface AppState {
    categories: Category[];
    transactions: Transaction[];
    theme: Theme;
    participants: string[];
}

type Action =
    | { type: 'ADD_TRANSACTION'; payload: Transaction }
    | { type: 'SET_THEME'; payload: Theme }
    | { type: 'SET_STATE'; payload: AppState }
    | { type: 'REORDER_CATEGORIES'; payload: Category[] }
    | { type: 'UPDATE_CATEGORY_BALANCE'; payload: { categoryId: string; balance: number } }
    | { type: 'ADD_CATEGORY'; payload: Category }
    | { type: 'UPDATE_CATEGORY'; payload: Category }
    | { type: 'DELETE_CATEGORY'; payload: string } // payload is categoryId
    | { type: 'ADD_PARTICIPANT'; payload: string }
    | { type: 'UPDATE_PARTICIPANT'; payload: { oldName: string; newName: string } }
    | { type: 'DELETE_PARTICIPANT'; payload: string }
    | { type: 'RESET_STATE' };

const initialState: AppState = {
    categories: INITIAL_CATEGORIES,
    transactions: [],
    theme: 'Полночь',
    participants: INITIAL_PARTICIPANTS,
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
        case 'ADD_CATEGORY':
            return {
                ...state,
                categories: [...state.categories, action.payload],
            };
        case 'UPDATE_CATEGORY':
            return {
                ...state,
                categories: state.categories.map(cat =>
                    cat.id === action.payload.id ? action.payload : cat
                ),
            };
        case 'DELETE_CATEGORY':
            return {
                ...state,
                categories: state.categories.filter(cat => cat.id !== action.payload),
                transactions: state.transactions.filter(tx => tx.categoryId !== action.payload && tx.toCategoryId !== action.payload),
            };
        case 'ADD_PARTICIPANT':
            if (state.participants.includes(action.payload)) {
                return state; // Avoid duplicates
            }
            return {
                ...state,
                participants: [...state.participants, action.payload],
            };
        case 'UPDATE_PARTICIPANT':
            return {
                ...state,
                participants: state.participants.map(p =>
                    p === action.payload.oldName ? action.payload.newName : p
                ),
                transactions: state.transactions.map(tx =>
                    tx.participant === action.payload.oldName
                        ? { ...tx, participant: action.payload.newName }
                        : tx
                ),
            };
        case 'DELETE_PARTICIPANT':
            // Cannot delete the 'Общие' participant
            if (action.payload === 'Общие') return state;
            return {
                ...state,
                participants: state.participants.filter(p => p !== action.payload),
                transactions: state.transactions.map(tx =>
                    tx.participant === action.payload
                        ? { ...tx, participant: 'Общие' } // Reassign to 'Shared'
                        : tx
                ),
            };
        case 'RESET_STATE':
            // Reset to initial state but preserve the theme
            return {
                ...initialState,
                theme: state.theme,
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
                if (!parsedState.categories || parsedState.categories.length === 0) {
                    parsedState.categories = INITIAL_CATEGORIES;
                }
                if (!parsedState.participants || parsedState.participants.length === 0) {
                    parsedState.participants = INITIAL_PARTICIPANTS;
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
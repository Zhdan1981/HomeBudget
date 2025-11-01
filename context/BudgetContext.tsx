

import React, { createContext, useReducer, useEffect, ReactNode, Dispatch, useContext, useCallback } from 'react';
import { Category, Transaction, Theme, TransactionType } from '../types';
import { INITIAL_CATEGORIES } from '../constants';
import { AuthContext } from './AuthContext';
import { getUserData, saveUserData } from '../services/api';
import { useDebounce } from '../hooks/useDebounce';

interface AppState {
    categories: Category[];
    transactions: Transaction[];
    theme: Theme;
    isDataLoaded: boolean;
}

type Action =
    | { type: 'ADD_TRANSACTION'; payload: Transaction }
    | { type: 'DELETE_TRANSACTION'; payload: string }
    | { type: 'SET_THEME'; payload: Theme }
    | { type: 'SET_USER_DATA'; payload: Omit<AppState, 'isDataLoaded'> }
    | { type: 'REORDER_CATEGORIES'; payload: Category[] }
    | { type: 'UPDATE_CATEGORY_BALANCE'; payload: { categoryId: string; balance: number } }
    | { type: 'ADD_CATEGORY'; payload: Category }
    | { type: 'UPDATE_CATEGORY'; payload: Category }
    | { type: 'DELETE_CATEGORY'; payload: string }
    | { type: 'RESET_STATE' }
    | { type: 'LOGOUT_USER' };

const initialState: AppState = {
    categories: [],
    transactions: [],
    theme: 'Полночь',
    isDataLoaded: false,
};

const getInitialUserState = (): Omit<AppState, 'isDataLoaded'> => ({
    categories: INITIAL_CATEGORIES,
    transactions: [],
    theme: 'Полночь',
});

const budgetReducer = (state: AppState, action: Action): AppState => {
    switch (action.type) {
        case 'ADD_TRANSACTION': {
            const transaction = action.payload;
            const newTransactions = [...state.transactions, transaction];
            const newCategories = state.categories.map(cat => {
                // For transfers/expenses, this is the source account. Balance decreases.
                // For income, amount is negative, so balance increases (balance - (-amount)).
                if (cat.id === transaction.categoryId) {
                    return { ...cat, balance: cat.balance - transaction.amount };
                }
                // For transfers (including expenses), this is the destination account. Balance increases.
                if (transaction.type === 'Перевод' && cat.id === transaction.toCategoryId) {
                    return { ...cat, balance: cat.balance + transaction.amount };
                }
                return cat;
            });
            return { ...state, transactions: newTransactions, categories: newCategories };
        }
        case 'DELETE_TRANSACTION': {
            const transactionId = action.payload;
            const transactionToDelete = state.transactions.find(tx => tx.id === transactionId);

            if (!transactionToDelete) {
                return state;
            }
            
            // Reverse the balance changes
            const newCategories = state.categories.map(cat => {
                // Re-add amount to the source category. Works for both positive (expense/transfer) and negative (income) amounts.
                if (cat.id === transactionToDelete.categoryId) {
                    return { ...cat, balance: cat.balance + transactionToDelete.amount };
                }
                // If it was a transfer, subtract amount from the destination category.
                if (transactionToDelete.type === TransactionType.Transfer && cat.id === transactionToDelete.toCategoryId) {
                    return { ...cat, balance: cat.balance - transactionToDelete.amount };
                }
                return cat;
            });

            const newTransactions = state.transactions.filter(tx => tx.id !== transactionId);

            return {
                ...state,
                transactions: newTransactions,
                categories: newCategories,
            };
        }
        case 'SET_THEME':
            return { ...state, theme: action.payload };
        case 'SET_USER_DATA': {
            const defaultUserData = getInitialUserState();
            return {
                ...state, // Preserve existing state properties like isDataLoaded
                ...defaultUserData, // Ensure all default fields are present
                ...action.payload, // Override with data from Firebase
                isDataLoaded: true,
            };
        }
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
        case 'RESET_STATE':
            return {
                ...getInitialUserState(),
                theme: state.theme, // Preserve theme on reset
                isDataLoaded: true,
            };
        case 'LOGOUT_USER':
            return initialState;
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
    const { user } = useContext(AuthContext);
    const [state, dispatch] = useReducer(budgetReducer, initialState);
    const debouncedState = useDebounce(state, 500);

    // Load user data on login
    useEffect(() => {
        if (user) {
            const loadData = async () => {
                const data = await getUserData(user.id);
                if (data) {
                    dispatch({ type: 'SET_USER_DATA', payload: data });
                } else {
                    // This is a new user, set initial state for them
                    const initialData = getInitialUserState();
                    dispatch({ type: 'SET_USER_DATA', payload: initialData });
                }
            };
            loadData();
        } else {
            dispatch({ type: 'LOGOUT_USER' });
        }
    }, [user]);

    // Save user data on change (debounced)
    useEffect(() => {
        if (user && debouncedState.isDataLoaded) {
            const { isDataLoaded, ...dataToSave } = debouncedState;
            saveUserData(user.id, dataToSave);
        }
    }, [debouncedState, user]);

    // Apply theme to DOM
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', state.theme);
    }, [state.theme]);

    return (
        <BudgetContext.Provider value={{ state, dispatch }}>
            {children}
        </BudgetContext.Provider>
    );
};
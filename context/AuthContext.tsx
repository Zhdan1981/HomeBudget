import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import * as api from '../services/api';
// FIX: Removed modular import for `onAuthStateChanged` as it was causing an error.
import { auth } from '../services/firebase';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

// Создаем контекст с начальными значениями
export const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
    login: async () => {},
    register: async () => {},
    logout: async () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Этот хук слушает изменения состояния аутентификации от Firebase
    useEffect(() => {
        // FIX: Switched to compat syntax `auth.onAuthStateChanged`.
        const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
            if (firebaseUser) {
                // Если пользователь вошел, обновляем состояние
                setUser({
                    id: firebaseUser.uid,
                    email: firebaseUser.email!,
                });
            } else {
                // Если пользователь вышел, сбрасываем состояние
                setUser(null);
            }
            // В любом случае, начальная проверка завершена
            setIsLoading(false);
        });

        // Отписываемся от слушателя при размонтировании компонента
        return () => unsubscribe();
    }, []);

    const login = async (email: string, password: string) => {
        await api.login(email, password);
        // onAuthStateChanged обработает обновление состояния user
    };

    const register = async (email: string, password: string) => {
        await api.register(email, password);
        // onAuthStateChanged обработает обновление состояния user
    };

    const logout = async () => {
        await api.logout();
        // onAuthStateChanged обработает обновление, но для мгновенной реакции UI
        // сбрасываем пользователя вручную.
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

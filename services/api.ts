// Этот файл теперь будет использовать Firebase для аутентификации и хранения данных.

import { User } from '../types';
import { auth, db } from './firebase'; // Импортируем настроенные Firebase сервисы
// FIX: Removed modular imports from 'firebase/auth' as they were causing errors.
// Auth functions will be called as methods on the imported `auth` object.
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { INITIAL_CATEGORIES, INITIAL_PARTICIPANTS } from '../constants';

// Функция для получения начальных данных для нового пользователя
const getInitialUserState = () => ({
    categories: INITIAL_CATEGORIES,
    transactions: [],
    theme: 'Полночь',
    participants: INITIAL_PARTICIPANTS,
});


// --- НОВЫЕ ФУНКЦИИ API НА FIREBASE ---

// РЕГИСТРАЦИЯ
export const register = async (email: string, password: string): Promise<{ user: User }> => {
    try {
        // 1. Создаем пользователя в Firebase Authentication
        // FIX: Switched to compat syntax `auth.createUserWithEmailAndPassword`.
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const firebaseUser = userCredential.user;

        // 2. Создаем для него документ в Firestore с начальными данными
        const initialData = getInitialUserState();
        // doc(db, 'collectionName', 'documentId') - создает ссылку на документ
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        // setDoc - записывает данные в этот документ
        await setDoc(userDocRef, initialData);

        // 3. Возвращаем нашего пользователя в нужном формате
        const appUser: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email!,
        };
        return { user: appUser };

    } catch (error: any) {
        // Firebase возвращает понятные ошибки, которые можно показать пользователю
        if (error.code === 'auth/email-already-in-use') {
            throw new Error('Этот email уже используется.');
        }
        throw new Error('Ошибка регистрации.');
    }
};

// ВХОД В СИСТЕМУ
export const login = async (email: string, password: string): Promise<{ user: User }> => {
    try {
        // Просто входим с помощью Firebase
        // FIX: Switched to compat syntax `auth.signInWithEmailAndPassword`.
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const firebaseUser = userCredential.user;

        const appUser: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email!,
        };
        return { user: appUser };

    } catch (error: any) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            throw new Error('Неверный email или пароль.');
        }
        throw new Error('Ошибка входа.');
    }
};

// ВЫХОД
export const logout = async (): Promise<void> => {
    // FIX: Switched to compat syntax `auth.signOut`.
    await auth.signOut(); // Просто выходим
};


// ПОЛУЧЕНИЕ ДАННЫХ ПОЛЬЗОВАТЕЛЯ ИЗ FIRESTORE
export const getUserData = async (userId: string): Promise<any | null> => {
    const userDocRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
        return docSnap.data(); // Возвращаем данные, если документ существует
    } else {
        console.log("No such document for user!");
        return null;
    }
}

// СОХРАНЕНИЕ ДАННЫХ ПОЛЬЗОВАТЕЛЯ В FIRESTORE
export const saveUserData = async (userId: string, data: any): Promise<void> => {
    const userDocRef = doc(db, 'users', userId);
    // setDoc перезапишет весь документ. Это то, что нам нужно,
    // так как мы всегда сохраняем всё состояние целиком.
    await setDoc(userDocRef, data);
}

// Функцию checkSession мы удаляем, так как Firebase предоставляет лучший механизм
// для отслеживания состояния аутентификации, который мы реализуем в AuthContext.

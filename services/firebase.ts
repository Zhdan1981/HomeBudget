// FIX: Switched to Firebase v9 compat imports for app and auth to resolve module errors.
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import { getFirestore } from "firebase/firestore";

// ВАЖНО: Так как вы не можете создать .env.local файл, конфигурация Firebase
// временно добавлена прямо в код.
// ПОЖАЛУЙСТА, ЗАМЕНИТЕ "YOUR_..." на ваши настоящие данные из консоли Firebase.
// ПРЕДУПРЕЖДЕНИЕ: Никогда не загружайте настоящие ключи в публичный репозиторий (GitHub)!
const firebaseConfig = {
  apiKey: "AIzaSyDOvAJOTtjsuuX8CYx_wV4RaTxp54ncclo",
  authDomain: "home-budget-app-4e835.firebaseapp.com",
  projectId: "home-budget-app-4e835",
  storageBucket: "home-budget-app-4e835.firebasestorage.app",
  messagingSenderId: "136381910419",
  appId: "1:136381910419:web:9b1eee41343e6269f1ec66",
  measurementId: "G-FCPNYTZLC2"
};


// Initialize Firebase
// Проверка, чтобы избежать повторной инициализации в средах с горячей перезагрузкой
const app = !firebase.apps.length ? firebase.initializeApp(firebaseConfig) : firebase.app();


// Экспортируем сервисы, которые будем использовать в других файлах
// FIX: Use compat `firebase.auth()` to get the auth service.
export const auth = firebase.auth();
export const db = getFirestore(app);
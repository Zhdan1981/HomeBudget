import React, { useState, useContext } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Wallet } from 'lucide-react';

const AuthPage: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, register, user, isLoading: authIsLoading } = useContext(AuthContext);
    const navigate = useNavigate();

    if (authIsLoading) {
        return <div className="bg-background min-h-screen flex items-center justify-center"></div>;
    }

    if (user) {
        return <Navigate to="/" replace />;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await register(email, password);
            }
            navigate('/', { replace: true });
        } catch (err: any) {
            setError(err.message || 'Произошла ошибка');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-text-primary flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <div className="inline-block p-4 bg-accent/20 rounded-full mb-4">
                        <Wallet size={40} className="text-accent" />
                    </div>
                    <h1 className="text-3xl font-bold">Домашний бюджет</h1>
                    <p className="text-text-secondary mt-2">
                        {isLogin ? 'Войдите, чтобы продолжить' : 'Создайте аккаунт, чтобы начать'}
                    </p>
                </div>
                
                <div className="bg-card p-8 rounded-2xl shadow-lg">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-background border border-border rounded-lg p-3 text-text-primary focus:ring-2 focus:ring-accent outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Пароль</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-background border border-border rounded-lg p-3 text-text-primary focus:ring-2 focus:ring-accent outline-none"
                                required
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-accent text-accent-text font-bold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Создать аккаунт')}
                        </button>
                    </form>
                </div>
                
                <div className="text-center mt-6">
                    <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-accent hover:underline">
                        {isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
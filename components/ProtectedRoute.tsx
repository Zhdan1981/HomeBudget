import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute: React.FC = () => {
    const { user, isLoading } = useContext(AuthContext);

    if (isLoading) {
        return (
            <div className="bg-background min-h-screen flex items-center justify-center">
                {/* You could add a spinner here */}
                <p className="text-text-secondary">Загрузка приложения...</p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/auth" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
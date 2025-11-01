import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface SubPageHeaderProps {
    title: string;
    onBack?: () => void;
}

const SubPageHeader: React.FC<SubPageHeaderProps> = ({ title, onBack }) => {
    const navigate = useNavigate();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            // Navigate to the main page instead of just going back in history.
            // This ensures a consistent UX where "back" from a sub-page
            // always returns to the main dashboard and prevents exiting the app
            // if there's no previous page in the history stack.
            navigate('/');
        }
    };

    return (
        <header className="p-4 flex justify-between items-center text-text-primary shrink-0 border-b border-border">
            <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-card">
                <ArrowLeft size={24} />
            </button>
            <h1 className="font-bold text-lg absolute left-1/2 -translate-x-1/2">
                {title}
            </h1>
            <div className="w-8"></div> {/* Spacer */}
        </header>
    );
};

export default SubPageHeader;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBudget } from '../hooks/useBudget';
import SubPageHeader from '../components/SubPageHeader';

const EditParticipantPage: React.FC = () => {
    const { name: participantName } = useParams<{ name: string }>();
    const navigate = useNavigate();
    const { state, dispatch } = useBudget();
    
    const isEditing = participantName !== 'new' && participantName !== undefined;
    
    const [name, setName] = useState('');
    
    useEffect(() => {
        if (isEditing) {
            setName(participantName || '');
        }
    }, [participantName, isEditing]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedName = name.trim();
        if (!trimmedName) {
            alert('Имя участника не может быть пустым.');
            return;
        }

        const isDuplicate = state.participants.some(p => p.toLowerCase() === trimmedName.toLowerCase() && p !== participantName);
        if (isDuplicate) {
            alert('Участник с таким именем уже существует.');
            return;
        }

        if (isEditing) {
            dispatch({ type: 'UPDATE_PARTICIPANT', payload: { oldName: participantName!, newName: trimmedName } });
        } else {
            dispatch({ type: 'ADD_PARTICIPANT', payload: trimmedName });
        }
        navigate('/settings', { replace: true });
    };
    
    return (
        <div className="bg-background text-text-primary min-h-screen font-sans flex flex-col">
            <SubPageHeader title={isEditing ? 'Редактировать участника' : 'Новый участник'} />
            
            <main className="flex-grow p-4 overflow-y-auto">
                <form id="participant-form" onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Имя участника</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-card border border-border rounded-lg p-3 text-text-primary focus:ring-2 focus:ring-accent outline-none"
                            required
                            autoFocus
                        />
                    </div>
                </form>
            </main>
            
            <footer className="p-4 shrink-0">
                <button type="submit" form="participant-form" className="w-full bg-accent text-accent-text font-bold py-3 rounded-lg hover:opacity-90 transition-opacity">
                    Сохранить
                </button>
            </footer>
        </div>
    );
};

export default EditParticipantPage;
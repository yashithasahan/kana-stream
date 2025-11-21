import React from 'react';
import { Play, Home, Pause } from 'lucide-react';
import { TranslationStrings } from '../../types';

interface PauseModalProps {
    t: TranslationStrings;
    onResume: () => void;
    onQuit: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({ t, onResume, onQuit }) => {
    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-xs bg-slate-800/90 rounded-3xl p-6 border border-slate-600 shadow-2xl text-center">
                <div className="text-white font-bold text-2xl mb-6 flex items-center justify-center gap-2">
                    <Pause size={24} /> {t.paused}
                </div>
                <div className="space-y-3">
                    <button onClick={onResume} className="w-full p-4 bg-yellow-500 hover:bg-yellow-400 text-slate-900 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2">
                        <Play size={20} fill="currentColor" /> {t.resume}
                    </button>
                    <button onClick={onQuit} className="w-full p-4 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2">
                        <Home size={20} /> {t.quit}
                    </button>
                </div>
            </div>
        </div>
    );
};

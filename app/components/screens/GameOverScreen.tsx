import React from 'react';
import { RotateCcw } from 'lucide-react';
import { TranslationStrings } from '../../types';

interface GameOverScreenProps {
    t: TranslationStrings;
    score: number;
    onTryAgain: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({ t, score, onTryAgain }) => {
    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-red-900/20 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm bg-slate-800 rounded-3xl p-8 border-2 border-red-500/50 shadow-2xl text-center animate-in zoom-in duration-300">
                <div className="text-6xl mb-4 animate-bounce">💀</div>
                <h2 className="text-3xl font-bold text-white mb-2">{t.streamLost}</h2>
                <p className="text-slate-400 mb-6">{t.score}<span className="text-yellow-400 font-mono text-2xl font-bold">{score}</span></p>

                <button onClick={onTryAgain} className="w-full px-8 py-4 bg-green-600 hover:bg-green-500 rounded-xl font-bold text-xl shadow-lg border-b-4 border-green-800 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2">
                    <RotateCcw size={20} /> {t.tryAgain}
                </button>
            </div>
        </div>
    );
};

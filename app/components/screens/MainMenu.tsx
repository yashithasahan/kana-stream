import React from 'react';
import { Play, Zap } from 'lucide-react';
import { TranslationStrings, ScriptType } from '../../types';

interface MainMenuScreenProps {
    t: TranslationStrings;
    highScore: number;
    scriptMode: ScriptType;
    onSetScriptMode: (mode: ScriptType) => void;
    onEnterSetup: (level: number) => void;
}

export const MainMenuScreen: React.FC<MainMenuScreenProps> = ({
    t,
    highScore,
    scriptMode,
    onSetScriptMode,
    onEnterSetup
}) => {
    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-2xl text-center animate-in zoom-in duration-300">
                <h1 className="text-4xl sm:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-yellow-500 mb-2 leading-tight">
                    {t.gameTitle}
                </h1>
                <p className="text-slate-400 mb-2 sm:mb-4 text-sm sm:text-base">{t.gameSubtitle}</p>

                {/* High Score Display */}
                <div className="inline-block bg-slate-900/50 px-4 py-1 rounded-full border border-slate-700/50 mb-6">
                    <span className="text-slate-400 text-xs uppercase font-bold mr-2">{t.highScore}</span>
                    <span className="text-yellow-400 font-mono font-bold">{highScore}</span>
                </div>

                <div className="mb-6 bg-slate-900/50 p-1.5 sm:p-2 rounded-xl border border-slate-700/50 flex">
                    <button
                        onClick={() => onSetScriptMode('katakana')}
                        className={`flex-1 py-2 sm:py-3 rounded-lg font-bold text-xs sm:text-sm transition-all ${scriptMode === 'katakana' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-400 hover:text-slate-300'}`}
                    >
                        Katakana (ア)
                    </button>
                    <button
                        onClick={() => onSetScriptMode('hiragana')}
                        className={`flex-1 py-2 sm:py-3 rounded-lg font-bold text-xs sm:text-sm transition-all ${scriptMode === 'hiragana' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-300'}`}
                    >
                        Hiragana (あ)
                    </button>
                </div>

                <div className="space-y-3">
                    <button onClick={() => onEnterSetup(1)} className="w-full p-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-lg shadow-lg border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2">
                        <Play size={20} /> {t.normal}
                        <span className="text-xs opacity-75 font-normal hidden sm:inline">{t.beginner}</span>
                    </button>
                    <button onClick={() => onEnterSetup(2)} className="w-full p-4 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold text-lg shadow-lg border-b-4 border-purple-800 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2">
                        <Zap size={20} /> {t.fast}
                    </button>
                    <button onClick={() => onEnterSetup(3)} className="w-full p-4 bg-rose-600 hover:bg-rose-500 rounded-xl font-bold text-lg shadow-lg border-b-4 border-rose-800 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2">
                        <Zap size={20} fill="currentColor" /> {t.insane}
                    </button>
                </div>
            </div>
        </div>
    );
};

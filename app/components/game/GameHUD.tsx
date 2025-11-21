import React from 'react';
import { Trophy, Heart, Info, Globe, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { GameState, Language } from '../../types';

interface GameHUDProps {
    score: number;
    lives: number;
    gameState: GameState;
    lang: Language;
    isMuted: boolean;
    onOpenAbout: () => void;
    onToggleLanguage: () => void;
    onTogglePause: () => void;
    onToggleMute: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
    score,
    lives,
    gameState,
    lang,
    isMuted,
    onOpenAbout,
    onToggleLanguage,
    onTogglePause,
    onToggleMute
}) => {
    return (
        <div className="absolute top-0 left-0 w-full p-2 sm:p-4 flex justify-between items-center z-30 pointer-events-none">
            <div className="flex items-center gap-2 sm:gap-4 bg-slate-900/50 backdrop-blur rounded-full px-3 py-1.5 sm:px-4 sm:py-2 border border-slate-700">
                <div className="flex items-center gap-1.5 sm:gap-2 text-yellow-400">
                    <Trophy size={16} className="sm:w-5 sm:h-5" />
                    <span className="text-lg sm:text-xl font-bold font-mono">{score}</span>
                </div>
                <div className="w-px h-4 sm:h-6 bg-slate-600"></div>
                <div className="flex items-center gap-0.5 sm:gap-1 text-red-500">
                    {[...Array(5)].map((_, i) => (
                        <Heart key={i} size={16} fill={i < lives ? "currentColor" : "none"} className={`sm:w-[18px] sm:h-[18px] ${i < lives ? "" : "opacity-30"}`} />
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 pointer-events-auto">
                <button
                    onClick={onOpenAbout}
                    className="p-2 sm:p-3 rounded-full transition-colors shadow-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex items-center justify-center"
                >
                    <Info size={18} className="sm:w-5 sm:h-5" />
                </button>

                <button
                    onClick={onToggleLanguage}
                    className="p-2 sm:p-3 rounded-full transition-colors shadow-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex items-center justify-center"
                    title={lang === 'en' ? "Switch to Sinhala" : "Switch to English"}
                >
                    <Globe size={18} className={`sm:w-5 sm:h-5 ${lang === 'si' ? 'text-indigo-400' : ''}`} />
                    <span className="ml-1.5 text-[10px] sm:text-xs font-bold">{lang === 'en' ? 'EN' : 'SI'}</span>
                </button>

                {(gameState === 'playing' || gameState === 'paused') && (
                    <button
                        onClick={onTogglePause}
                        className="p-2 sm:p-3 rounded-full transition-colors shadow-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300"
                        title={gameState === 'paused' ? "Resume Game" : "Pause Game"}
                    >
                        {gameState === 'paused' ? <Play size={18} className="sm:w-5 sm:h-5" /> : <Pause size={18} className="sm:w-5 sm:h-5" />}
                    </button>
                )}

                <button
                    onClick={onToggleMute}
                    className={`p-2 sm:p-3 rounded-full transition-colors shadow-lg border border-slate-700 ${isMuted ? 'bg-red-900/80 text-red-400' : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'}`}
                    title={isMuted ? "Unmute Music & SFX" : "Mute Music & SFX"}
                >
                    {isMuted ? <VolumeX size={18} className="sm:w-5 sm:h-5" /> : <Volume2 size={18} className="sm:w-5 sm:h-5" />}
                </button>
            </div>
        </div>
    );
};

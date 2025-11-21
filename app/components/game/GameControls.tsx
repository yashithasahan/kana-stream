import React from 'react';
import { CharData, Tile, TranslationStrings } from '../../types';

interface GameControlsProps {
    options: CharData[];
    tiles: Tile[];
    activeIndex: number;
    onAnswer: (romaji: string) => void;
    t: TranslationStrings;
}

export const GameControls: React.FC<GameControlsProps> = ({ options, tiles, activeIndex, onAnswer, t }) => {
    const getGridClass = (count: number) => {
        if (count === 2) return 'grid-cols-2 max-w-xl';
        if (count === 3) return 'grid-cols-3 max-w-3xl';
        return 'grid-cols-4 max-w-3xl';
    };

    return (
        <div className="absolute bottom-12 sm:bottom-16 left-0 w-full z-20 px-4 pb-safe">
            <div className={`mx-auto grid gap-3 sm:gap-6 ${getGridClass(options.length)} transition-all duration-500`}>
                {options.map((opt, idx) => (
                    <button
                        key={idx}
                        // Use onClick for unified handling, prevent default to stop double-firing on some touch devices
                        onClick={(e) => {
                            e.preventDefault();
                            onAnswer(opt.romaji);
                        }}
                        className="
                        h-20 sm:h-28 rounded-2xl bg-slate-700/90 backdrop-blur hover:bg-slate-600 
                        active:bg-slate-500 active:scale-95 transition-all
                        border-b-4 border-slate-800 active:border-b-0 active:translate-y-1
                        flex flex-col items-center justify-center
                        shadow-lg shadow-black/20
                        group touch-manipulation cursor-pointer select-none
                    "
                    >
                        <span className="text-2xl sm:text-4xl font-bold text-white mb-0.5">{opt.romaji}</span>
                    </button>
                ))}
                {options.length === 0 && (
                    <div className="col-span-full text-center text-slate-500 animate-pulse py-4">{t.searching}</div>
                )}
            </div>
            <div className="text-center text-slate-500 text-[10px] sm:text-xs mt-4 opacity-50">
                {t.instruction}
                {/* VISUAL DEBUG: Displays the current target character to allow user to verify */}
                {tiles.length > 0 && tiles[activeIndex] && (
                    <span className="ml-2 font-mono text-slate-400 font-bold border border-slate-700 px-2 py-0.5 rounded bg-slate-800">
                        {t.target}{tiles[activeIndex].char}
                    </span>
                )}
            </div>
        </div>
    );
};

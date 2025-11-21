import React from 'react';
import { Tile, Orientation, TranslationStrings } from '../../types';

interface GameStreamProps {
    tiles: Tile[];
    orientation: Orientation;
    activeIndex: number;
    tileWidth: number;
    t: TranslationStrings;
}

export const GameStream: React.FC<GameStreamProps> = ({ tiles, orientation, activeIndex, tileWidth, t }) => {
    return (
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center z-0">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

            {/* TARGET LINE */}
            {orientation === 'horizontal' ? (
                <>
                    <div className="absolute left-8 sm:left-24 top-0 h-full w-0.5 border-l-2 border-dashed border-yellow-500/20 z-0"></div>
                    <div className="absolute left-8 sm:left-24 bottom-28 sm:bottom-32 text-yellow-500/30 text-[10px] sm:text-xs uppercase tracking-widest -translate-x-1/2 rotate-90 sm:rotate-0 origin-left font-bold">
                        {t.targetLabel}
                    </div>
                </>
            ) : (
                <>
                    {/* Mobile: Horizontal Line near bottom */}
                    <div className="absolute bottom-[35%] left-0 w-full h-0.5 border-t-2 border-dashed border-yellow-500/20 z-0"></div>
                    <div className="absolute right-4 bottom-[35%] text-yellow-500/30 text-[10px] uppercase tracking-widest translate-y-full pt-2 font-bold">
                        {t.targetLabel}
                    </div>
                </>
            )}

            <div className="w-full h-full relative">
                {tiles.map((tile, index) => {
                    const isTarget = index === activeIndex && tile.status === 'pending';
                    const size = tileWidth;

                    return (
                        <div
                            key={tile.id}
                            className={`absolute flex flex-col items-center justify-center
                          transition-transform duration-75 will-change-transform
                          ${tile.status === 'correct' ? 'scale-110 z-10' : 'scale-100 z-0'}
                      `}
                            style={{
                                transform: `translate(${Math.round(tile.x)}px, ${Math.round(tile.y)}px)`,
                                width: `${size}px`,
                                height: `${size}px`,
                                // Reset top/left since we use translate for performance
                                top: 0,
                                left: 0,
                            }}
                        >
                            <div className={`
                          w-full h-full rounded-xl flex items-center justify-center text-3xl sm:text-4xl font-bold shadow-xl border-b-4
                          transition-all duration-200
                          ${tile.status === 'correct' ? 'bg-green-500 border-green-700 text-white animate-bounce' : ''}
                          ${tile.status === 'wrong' ? 'bg-red-500 border-red-700 text-white opacity-50 grayscale' : ''}
                          ${tile.status === 'pending' && isTarget ? 'bg-yellow-400 border-yellow-600 text-slate-900 scale-110 shadow-yellow-400/50 ring-4 ring-yellow-400/30' : ''}
                          ${tile.status === 'pending' && !isTarget ? 'bg-slate-700 border-slate-900 text-slate-400' : ''}
                      `}>
                                {tile.char}
                            </div>
                            {tile.status !== 'pending' && (
                                <div className="mt-1 sm:mt-2 text-xs sm:text-sm font-mono font-bold text-white/80 bg-black/50 px-1.5 sm:px-2 rounded animate-in fade-in slide-in-from-top-2">
                                    {tile.romaji}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

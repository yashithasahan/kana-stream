import React from 'react';
import { Check } from 'lucide-react';

interface ModeToggleProps {
    label: string;
    subLabel: string;
    isActive: boolean;
    onClick: () => void;
    colorClass: string;
}

export const ModeToggle: React.FC<ModeToggleProps> = ({ label, subLabel, isActive, onClick, colorClass }) => (
    <button
        onClick={onClick}
        className={`relative w-full p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between group touch-manipulation
      ${isActive
                ? `bg-slate-800 border-${colorClass}-500 shadow-[0_0_15px_rgba(0,0,0,0.3)] translate-y-0`
                : 'bg-slate-800/50 border-slate-700 text-slate-500 hover:bg-slate-800 hover:border-slate-600'
            }`}
    >
        <div className="flex flex-col items-start text-left">
            <span className={`text-base sm:text-lg font-bold ${isActive ? 'text-white' : 'text-slate-400'}`}>{label}</span>
            <span className="text-[10px] sm:text-xs font-medium opacity-60 text-slate-500">{subLabel}</span>
        </div>
        <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-colors
      ${isActive ? `bg-${colorClass}-500 border-${colorClass}-500` : 'border-slate-600 bg-transparent'}`}>
            {isActive && <Check size={14} className="text-white" />}
        </div>
    </button>
);

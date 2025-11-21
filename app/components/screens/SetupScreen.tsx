import React from 'react';
import { ArrowLeft, Play } from 'lucide-react';
import { SettingsState, ScriptType, TranslationStrings } from '../../types';
import { ModeToggle } from '../ui/ModeToggle';

interface SetupScreenProps {
    t: TranslationStrings;
    settings: SettingsState;
    scriptMode: ScriptType;
    poolSize: number;
    onBack: () => void;
    onToggleSetting: (key: keyof SettingsState) => void;
    onLaunch: () => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({
    t,
    settings,
    scriptMode,
    poolSize,
    onBack,
    onToggleSetting,
    onLaunch
}) => {
    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-md p-4">
            <div className="w-full max-w-md bg-slate-800 rounded-3xl p-6 border border-slate-700 shadow-2xl flex flex-col animate-in slide-in-from-bottom-10">
                {/* Header */}
                <div className="flex items-center space-x-4 mb-6">
                    <button onClick={onBack} className="p-2 bg-slate-700 rounded-xl hover:bg-slate-600 transition-colors text-slate-300">
                        <ArrowLeft size={20} />
                    </button>
                    <h2 className="text-2xl font-bold text-white">{t.setupTitle}</h2>
                </div>

                {/* Toggles */}
                <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                    <ModeToggle
                        label={t.basicDesc(scriptMode === 'hiragana' ? 'Hiragana' : 'Katakana')}
                        subLabel={`A-N`}
                        isActive={settings.seion}
                        onClick={() => onToggleSetting('seion')}
                        colorClass="blue"
                    />
                    <ModeToggle
                        label={t.dakuten}
                        subLabel={t.dakutenDesc}
                        isActive={settings.dakuten}
                        onClick={() => onToggleSetting('dakuten')}
                        colorClass="green"
                    />
                    <ModeToggle
                        label={t.combos}
                        subLabel={t.combosDesc}
                        isActive={settings.yoon}
                        onClick={() => onToggleSetting('yoon')}
                        colorClass="purple"
                    />
                </div>

                {/* Info */}
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 text-center mb-6">
                    <p className="text-slate-400 text-sm">{t.poolSize}</p>
                    <p className="text-3xl font-bold text-white">{poolSize}</p>
                </div>

                {/* Start Action */}
                <button
                    onClick={onLaunch}
                    disabled={poolSize === 0}
                    className={`w-full py-5 rounded-2xl font-bold text-xl flex items-center justify-center space-x-2 transition-all transform active:scale-95 shadow-lg
             ${poolSize > 0
                            ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-900/20 border-b-4 border-blue-800 active:border-b-0 active:translate-y-1'
                            : 'bg-slate-700 text-slate-500 cursor-not-allowed border-b-4 border-slate-800'}`}
                >
                    <span>{t.startStream}</span>
                    <Play size={24} fill="currentColor" />
                </button>
            </div>
        </div>
    );
};

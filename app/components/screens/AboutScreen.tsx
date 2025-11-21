import React from 'react';
import { ArrowLeft, User, Mail } from 'lucide-react';
import { TranslationStrings } from '../../types';

interface AboutScreenProps {
    t: TranslationStrings;
    onClose: () => void;
}

export const AboutScreen: React.FC<AboutScreenProps> = ({ t, onClose }) => {
    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-md p-4">
            <div className="w-full max-w-md bg-slate-800 rounded-3xl p-6 border border-slate-700 shadow-2xl flex flex-col animate-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center space-x-4 mb-6">
                    <button onClick={onClose} className="p-2 bg-slate-700 rounded-xl hover:bg-slate-600 transition-colors text-slate-300">
                        <ArrowLeft size={20} />
                    </button>
                    <h2 className="text-2xl font-bold text-white">{t.aboutTitle}</h2>
                </div>

                {/* Content */}
                <div className="space-y-6">
                    <div className="bg-slate-700/50 p-4 rounded-xl border border-slate-600/50">
                        <p className="text-slate-300 text-lg leading-relaxed text-center">
                            {t.aboutText}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center space-x-3 bg-slate-800 p-3 rounded-lg border border-slate-700">
                            <div className="bg-indigo-900/50 p-2 rounded-full text-indigo-400">
                                <User size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-bold uppercase">{t.developer}</p>
                                <p className="text-white font-bold">Yashitha Sahan</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3 bg-slate-800 p-3 rounded-lg border border-slate-700">
                            <div className="bg-emerald-900/50 p-2 rounded-full text-emerald-400">
                                <Mail size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-bold uppercase">{t.feedback}</p>
                                <a href="mailto:yashithasahan.dev@gmail.com" className="text-white font-bold hover:text-emerald-300 transition-colors">
                                    yashithasahan.dev@gmail.com
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

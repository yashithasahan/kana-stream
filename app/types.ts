import React from 'react';

export interface CharData {
    char: string;
    romaji: string;
}

export interface ScriptData {
    seion: CharData[];
    dakuten: CharData[];
    yoon: CharData[];
}

export interface Tile extends CharData {
    id: number;
    x: number;
    y: number;
    status: 'pending' | 'correct' | 'wrong';
}

export interface SettingsState {
    seion: boolean;
    dakuten: boolean;
    yoon: boolean;
}

export type GameState = 'menu' | 'setup' | 'playing' | 'paused' | 'gameover' | 'about';
export type Language = 'en' | 'si';
export type ScriptType = 'katakana' | 'hiragana';
export type Orientation = 'horizontal' | 'vertical';

export interface TranslationStrings {
    gameTitle: React.ReactNode;
    gameSubtitle: string;
    normal: string;
    fast: string;
    insane: string;
    beginner: string;
    setupTitle: string;
    basicDesc: (script: string) => string;
    dakuten: string;
    dakutenDesc: string;
    combos: string;
    combosDesc: string;
    poolSize: string;
    startStream: string;
    searching: string;
    instruction: string;
    target: string;
    targetLabel: string;
    paused: string;
    resume: string;
    quit: string;
    streamLost: string;
    score: string;
    highScore: string;
    tryAgain: string;
    locked: string;
    selectScript: string;
    aboutTitle: string;
    aboutText: string;
    developer: string;
    feedback: string;
}

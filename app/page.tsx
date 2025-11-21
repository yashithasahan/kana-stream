'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Play, RotateCcw, Heart, Zap, Trophy, Volume2, VolumeX, Pause, Home, Settings, Check, ChevronRight, ArrowLeft, Globe, Type, Info, Mail, User } from 'lucide-react';

// --- Constants ---
const TILE_SIZE = 80; // Used for both width/height depending on orientation
const SPAWN_GAP = 160;

// --- Types & Interfaces ---

interface CharData {
  char: string;
  romaji: string;
}

interface ScriptData {
  seion: CharData[];
  dakuten: CharData[];
  yoon: CharData[];
}

interface Tile extends CharData {
  id: number;
  x: number;
  y: number;
  status: 'pending' | 'correct' | 'wrong';
}

interface SettingsState {
  seion: boolean;
  dakuten: boolean;
  yoon: boolean;
}

type GameState = 'menu' | 'setup' | 'playing' | 'paused' | 'gameover' | 'about';
type Language = 'en' | 'si';
type ScriptType = 'katakana' | 'hiragana';
type Orientation = 'horizontal' | 'vertical'; 

interface TranslationStrings {
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

// --- Game Data ---

const KATAKANA_DATA: ScriptData = {
  seion: [
    { char: 'ア', romaji: 'a' }, { char: 'イ', romaji: 'i' }, { char: 'ウ', romaji: 'u' }, { char: 'え', romaji: 'e' }, { char: 'オ', romaji: 'o' },
    { char: 'カ', romaji: 'ka' }, { char: 'キ', romaji: 'ki' }, { char: 'ク', romaji: 'ku' }, { char: 'ケ', romaji: 'ke' }, { char: 'コ', romaji: 'ko' },
    { char: 'サ', romaji: 'sa' }, { char: 'シ', romaji: 'shi' }, { char: 'ス', romaji: 'su' }, { char: 'セ', romaji: 'se' }, { char: 'ソ', romaji: 'so' },
    { char: 'タ', romaji: 'ta' }, { char: 'チ', romaji: 'chi' }, { char: 'ツ', romaji: 'tsu' }, { char: 'テ', romaji: 'te' }, { char: 'ト', romaji: 'to' },
    { char: 'ナ', romaji: 'na' }, { char: 'ニ', romaji: 'ni' }, { char: 'ヌ', romaji: 'nu' }, { char: 'ネ', romaji: 'ne' }, { char: 'ノ', romaji: 'no' },
    { char: 'ハ', romaji: 'ha' }, { char: 'ヒ', romaji: 'hi' }, { char: 'フ', romaji: 'fu' }, { char: 'ヘ', romaji: 'he' }, { char: 'ホ', romaji: 'ho' },
    { char: 'マ', romaji: 'ma' }, { char: 'ミ', romaji: 'mi' }, { char: 'ム', romaji: 'mu' }, { char: 'メ', romaji: 'me' }, { char: 'モ', romaji: 'mo' },
    { char: 'ヤ', romaji: 'ya' }, { char: 'ユ', romaji: 'yu' }, { char: 'ヨ', romaji: 'yo' },
    { char: 'ラ', romaji: 'ra' }, { char: 'リ', romaji: 'ri' }, { char: 'ル', romaji: 'ru' }, { char: 'レ', romaji: 're' }, { char: 'ロ', romaji: 'ro' },
    { char: 'ワ', romaji: 'wa' }, { char: 'ヲ', romaji: 'wo' }, { char: 'ン', romaji: 'n' },
  ],
  dakuten: [
    { char: 'ガ', romaji: 'ga' }, { char: 'ギ', romaji: 'gi' }, { char: 'グ', romaji: 'gu' }, { char: 'ゲ', romaji: 'ge' }, { char: 'ゴ', romaji: 'go' },
    { char: 'ザ', romaji: 'za' }, { char: 'ジ', romaji: 'ji' }, { char: 'ズ', romaji: 'zu' }, { char: 'ゼ', romaji: 'ze' }, { char: 'ゾ', romaji: 'zo' },
    { char: 'ダ', romaji: 'da' }, { char: 'ぢ', romaji: 'ji' }, { char: 'づ', romaji: 'zu' }, { char: 'デ', romaji: 'de' }, { char: 'ド', romaji: 'do' },
    { char: 'バ', romaji: 'ba' }, { char: 'ビ', romaji: 'bi' }, { char: 'ブ', romaji: 'bu' }, { char: 'ベ', romaji: 'be' }, { char: 'ボ', romaji: 'bo' },
    { char: 'パ', romaji: 'pa' }, { char: 'ピ', romaji: 'pi' }, { char: 'プ', romaji: 'pu' }, { char: 'ペ', romaji: 'pe' }, { char: 'ポ', romaji: 'po' }
  ],
  yoon: [
    { char: 'キャ', romaji: 'kya' }, { char: 'キュ', romaji: 'kyu' }, { char: 'キョ', romaji: 'kyo' },
    { char: 'シャ', romaji: 'sha' }, { char: 'シュ', romaji: 'shu' }, { char: 'ショ', romaji: 'sho' },
    { char: 'チャ', romaji: 'cha' }, { char: 'チュ', romaji: 'chu' }, { char: 'チョ', romaji: 'cho' },
    { char: 'ニャ', romaji: 'nya' }, { char: 'ニュ', romaji: 'nyu' }, { char: 'ニョ', romaji: 'nyo' },
    { char: 'ヒャ', romaji: 'hya' }, { char: 'ヒュ', romaji: 'hyu' }, { char: 'ヒョ', romaji: 'hyo' },
    { char: 'ミャ', romaji: 'mya' }, { char: 'ミュ', romaji: 'myu' }, { char: 'ミョ', romaji: 'myo' },
    { char: 'リャ', romaji: 'rya' }, { char: 'リュ', romaji: 'ryu' }, { char: 'リョ', romaji: 'ryo' },
    { char: 'ギャ', romaji: 'gya' }, { char: 'ギュ', romaji: 'gyu' }, { char: 'ギョ', romaji: 'gyo' },
    { char: 'ジャ', romaji: 'ja' },  { char: 'ジュ', romaji: 'ju' },  { char: 'ジョ', romaji: 'jo' },
    { char: 'ビャ', romaji: 'bya' }, { char: 'ビュ', romaji: 'byu' }, { char: 'ビョ', romaji: 'byo' },
    { char: 'ピャ', romaji: 'pya' }, { char: 'ピュ', romaji: 'pyu' }, { char: 'ピョ', romaji: 'pyo' },
  ]
};

const HIRAGANA_DATA: ScriptData = {
  seion: [
    { char: 'あ', romaji: 'a' }, { char: 'い', romaji: 'i' }, { char: 'う', romaji: 'u' }, { char: 'え', romaji: 'e' }, { char: 'お', romaji: 'o' },
    { char: 'か', romaji: 'ka' }, { char: 'き', romaji: 'ki' }, { char: 'く', romaji: 'ku' }, { char: 'け', romaji: 'ke' }, { char: 'こ', romaji: 'ko' },
    { char: 'さ', romaji: 'sa' }, { char: 'し', romaji: 'shi' }, { char: 'す', romaji: 'su' }, { char: 'せ', romaji: 'se' }, { char: 'そ', romaji: 'so' },
    { char: 'た', romaji: 'ta' }, { char: 'ち', romaji: 'chi' }, { char: 'つ', romaji: 'tsu' }, { char: 'て', romaji: 'te' }, { char: 'と', romaji: 'to' },
    { char: 'な', romaji: 'na' }, { char: 'に', romaji: 'ni' }, { char: 'ぬ', romaji: 'nu' }, { char: 'ね', romaji: 'ne' }, { char: 'の', romaji: 'no' },
    { char: 'は', romaji: 'ha' }, { char: 'ひ', romaji: 'hi' }, { char: 'ふ', romaji: 'fu' }, { char: 'へ', romaji: 'he' }, { char: 'ほ', romaji: 'ho' },
    { char: 'ま', romaji: 'ma' }, { char: 'み', romaji: 'mi' }, { char: 'む', romaji: 'mu' }, { char: 'め', romaji: 'me' }, { char: 'も', romaji: 'mo' },
    { char: 'や', romaji: 'ya' }, { char: 'ゆ', romaji: 'yu' }, { char: 'よ', romaji: 'yo' },
    { char: 'ら', romaji: 'ra' }, { char: 'り', romaji: 'ri' }, { char: 'る', romaji: 'ru' }, { char: 'れ', romaji: 're' }, { char: 'ろ', romaji: 'ro' },
    { char: 'わ', romaji: 'wa' }, { char: 'を', romaji: 'wo' }, { char: 'ん', romaji: 'n' },
  ],
  dakuten: [
    { char: 'が', romaji: 'ga' }, { char: 'ぎ', romaji: 'gi' }, { char: 'ぐ', romaji: 'gu' }, { char: 'げ', romaji: 'ge' }, { char: 'ご', romaji: 'go' },
    { char: 'ざ', romaji: 'za' }, { char: 'じ', romaji: 'ji' }, { char: 'ず', romaji: 'zu' }, { char: 'ぜ', romaji: 'ze' }, { char: 'ぞ', romaji: 'zo' },
    { char: 'だ', romaji: 'da' }, { char: 'ぢ', romaji: 'ji' }, { char: 'づ', romaji: 'zu' }, { char: 'で', romaji: 'de' }, { char: 'ど', romaji: 'do' },
    { char: 'ば', romaji: 'ba' }, { char: 'び', romaji: 'bi' }, { char: 'ぶ', romaji: 'bu' }, { char: 'べ', romaji: 'be' }, { char: 'ぼ', romaji: 'bo' },
    { char: 'ぱ', romaji: 'pa' }, { char: 'ぴ', romaji: 'pi' }, { char: 'ぷ', romaji: 'pu' }, { char: 'ぺ', romaji: 'pe' }, { char: 'ぽ', romaji: 'po' },
  ],
  yoon: [
    { char: 'きゃ', romaji: 'kya' }, { char: 'きゅ', romaji: 'kyu' }, { char: 'きょ', romaji: 'kyo' },
    { char: 'しゃ', romaji: 'sha' }, { char: 'しゅ', romaji: 'shu' }, { char: 'しょ', romaji: 'sho' },
    { char: 'ちゃ', romaji: 'cha' }, { char: 'ちゅ', romaji: 'chu' }, { char: 'ちょ', romaji: 'cho' },
    { char: 'にゃ', romaji: 'nya' }, { char: 'にゅ', romaji: 'nyu' }, { char: 'にょ', romaji: 'nyo' },
    { char: 'ひゃ', romaji: 'hya' }, { char: 'ひゅ', romaji: 'hyu' }, { char: 'ひょ', romaji: 'hyo' },
    { char: 'みゃ', romaji: 'mya' }, { char: 'ミュ', romaji: 'myu' }, { char: 'ミョ', romaji: 'myo' },
    { char: 'りゃ', romaji: 'rya' }, { char: 'りゅ', romaji: 'ryu' }, { char: 'りょ', romaji: 'ryo' },
    { char: 'ぎゃ', romaji: 'gya' }, { char: 'ぎゅ', romaji: 'gyu' }, { char: 'ぎょ', romaji: 'gyo' },
    { char: 'じゃ', romaji: 'ja' },  { char: 'じゅ', romaji: 'ju' },  { char: 'じょ', romaji: 'jo' },
    { char: 'びゃ', romaji: 'bya' }, { char: 'びゅ', romaji: 'byu' }, { char: 'びょ', romaji: 'byo' },
    { char: 'ぴゃ', romaji: 'pya' }, { char: 'ぴゅ', romaji: 'pyu' }, { char: 'ぴょ', romaji: 'pyo' },
  ]
};

// --- Translations ---
const TRANSLATIONS: Record<Language, TranslationStrings> = {
  en: {
    gameTitle: <>KANA<br/>STREAM</>,
    gameSubtitle: "Master Japanese Characters",
    normal: "Normal",
    fast: "Fast",
    insane: "Insane",
    beginner: "(Beginner Friendly)",
    setupTitle: "Setup Deck",
    basicDesc: (script) => `Basic ${script} (A-N)`,
    dakuten: "Dakuten",
    dakutenDesc: "Ten-Ten & Maru-Ten (Ga, Pa...)",
    combos: "Combos",
    combosDesc: "Yoon (Kya, Shu...)",
    poolSize: "Selected Pool Size",
    startStream: "Start Stream",
    searching: "Searching stream...",
    instruction: "Tap the romaji matching the YELLOW tile",
    target: "Target: ",
    targetLabel: "TARGET",
    paused: "PAUSED",
    resume: "Resume",
    quit: "Quit to Menu",
    streamLost: "Stream Lost",
    score: "Score: ",
    highScore: "Best: ",
    tryAgain: "Try Again",
    locked: "Locked",
    selectScript: "Select Script",
    aboutTitle: "About",
    aboutText: "Made with ❤️ for all Japanese learners to interactively and quickly memorize kana characters.",
    developer: "Developer",
    feedback: "Feedback",
  },
  si: {
    gameTitle: <>කනා<br/>ස්ට්‍රීම්</>,
    gameSubtitle: "ජපන් අක්ෂර මාලාව ප්‍රගුණ කරන්න",
    normal: "සාමාන්‍ය",
    fast: "වේගවත්",
    insane: "ඉතා වේගවත්",
    beginner: "(ආධුනිකයන්ට සුදුසුයි)",
    setupTitle: "කාඩ් සකසන්න",
    basicDesc: (script) => `මූලික ${script === 'Hiragana' ? 'හිරගනා' : 'කටකන'} (A-N)`,
    dakuten: "දකුටෙන්",
    dakutenDesc: "ටෙන්-ටෙන් සහ මරු-ටෙන් (Ga, Pa...)",
    combos: "එකතුව",
    combosDesc: "යූන් (Kya, Shu...)",
    poolSize: "තෝරාගත් අකුරු ගණන",
    startStream: "ආරම්භ කරන්න",
    searching: "සොයමින් පවතී...",
    instruction: "කහ පැහැති කොටුවට ගැලපෙන අකුර තෝරන්න",
    target: "ඉලක්කය: ",
    targetLabel: "ඉලක්කය",
    paused: "නවතාලන ලදි",
    resume: "යලි අරඹන්න",
    quit: "මෙනුවට යන්න",
    streamLost: "පරාජිතයි",
    score: "ලකුණු: ",
    highScore: "උපරිම ලකුණු: ",
    tryAgain: "නැවත උත්සාහ කරන්න",
    locked: "අගුලු දමා ඇත",
    selectScript: "අක්ෂර මාලාව තෝරන්න",
    aboutTitle: "විස්තර",
    aboutText: "ජපන් භාෂාව ඉගෙන ගන්නා සියලු දෙනාටම, අකුරු පහසුවෙන් සහ ඉක්මනින් මතක තබා ගැනීමට නිර්මාණය කරන ලද්දකි. ඔබගේ ජපන් සිහිනයට සුබ පැතුම් ❤️.",
    developer: "නිර්මාණය",
    feedback: "අදහස්",
  }
};

// --- Helper Component for Toggles ---
interface ModeToggleProps {
  label: string;
  subLabel: string;
  isActive: boolean;
  onClick: () => void;
  colorClass: string;
}

const ModeToggle: React.FC<ModeToggleProps> = ({ label, subLabel, isActive, onClick, colorClass }) => (
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

// --- Main Component ---
export default function KanaStream() {
  // UI State
  const [gameState, setGameState] = useState<GameState>('menu'); 
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(5);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [options, setOptions] = useState<CharData[]>([]);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [lang, setLang] = useState<Language>('si'); // Default to Sinhala
  const [scriptMode, setScriptMode] = useState<ScriptType>('katakana');
  const [orientation, setOrientation] = useState<Orientation>('horizontal');
  
  // Settings State
  const [settings, setSettings] = useState<SettingsState>({
    seion: true,
    dakuten: false,
    yoon: false
  });
  const [selectedLevel, setSelectedLevel] = useState<number>(1);

  // Logic State (Refs)
  const gameStateRef = useRef<GameState>('menu');
  const prevGameStateRef = useRef<GameState>('menu'); // Track previous state for About screen
  const livesRef = useRef<number>(5);
  const speedRef = useRef<number>(2);
  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | undefined>(undefined);
  const tilesRef = useRef<Tile[]>([]);
  const activeIndexRef = useRef<number>(0);
  const scoreRef = useRef<number>(0);
  const containerRef = useRef<{ width: number, height: number }>({ width: 0, height: 0 });
  const levelRef = useRef<number>(1); 
  const tileWidthRef = useRef<number>(80); // Dynamic tile width
  
  // Initialize Storage on Mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load High Score
      const savedHighScore = localStorage.getItem('kana_highscore');
      if (savedHighScore) {
        setHighScore(parseInt(savedHighScore, 10));
      }

      // Load Language Preference
      const savedLang = localStorage.getItem('kana_lang');
      if (savedLang && (savedLang === 'en' || savedLang === 'si')) {
        setLang(savedLang as Language);
      }
    }
  }, []);

  // Save Language Preference
  const toggleLanguage = () => {
    const newLang = lang === 'en' ? 'si' : 'en';
    setLang(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('kana_lang', newLang);
    }
  };
  
  // Helper for calculating pool
  const currentPool = useMemo<CharData[]>(() => {
    let pool: CharData[] = [];
    const sourceData = scriptMode === 'katakana' ? KATAKANA_DATA : HIRAGANA_DATA;
    
    if (settings.seion) pool = [...pool, ...sourceData.seion];
    if (settings.dakuten) pool = [...pool, ...sourceData.dakuten];
    if (settings.yoon) pool = [...pool, ...sourceData.yoon];
    return pool;
  }, [settings, scriptMode]);

  const t = TRANSLATIONS[lang]; 

  // --- AUDIO ENGINE ---
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nextNoteTimeRef = useRef<number>(0);
  const beatCountRef = useRef<number>(0);
  const isMusicPlayingRef = useRef<boolean>(false);
  const schedulerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const initAudio = () => {
    try {
      if (!audioCtxRef.current) {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
          audioCtxRef.current = new AudioContext();
        }
      }
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      
      if (!isMusicPlayingRef.current && !isMuted) {
        isMusicPlayingRef.current = true;
        if (audioCtxRef.current) {
            nextNoteTimeRef.current = audioCtxRef.current.currentTime + 0.1;
            beatCountRef.current = 0;
            scheduleBeat();
        }
      }
    } catch (e) {
      console.error("Audio initialization failed:", e);
    }
  };

  // --- Drum Synthesis ---
  const playKick = (time: number) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
    
    gain.gain.setValueAtTime(1, time); 
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(time);
    osc.stop(time + 0.5);
  };

  const playSnare = (time: number) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    
    const bufferSize = ctx.sampleRate * 0.5; 
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 1000;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.7, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
    
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    const oscGain = ctx.createGain();
    osc.frequency.setValueAtTime(100, time);
    oscGain.gain.setValueAtTime(0.4, time);
    oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
    
    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    
    noise.start(time);
    osc.start(time);
    osc.stop(time + 0.2);
    noise.stop(time + 0.2);
  };

  const playHiHat = (time: number, open: boolean = false) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const bufferSize = ctx.sampleRate * 0.3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 10000;

    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 7000;
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + (open ? 0.15 : 0.05));

    noise.connect(bandpass);
    bandpass.connect(highpass);
    highpass.connect(gain);
    gain.connect(ctx.destination);
    
    noise.start(time);
    noise.stop(time + 0.2);
  };

  const playBass = (time: number, freq: number) => {
      if (!audioCtxRef.current) return;
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, time);
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, time);
      filter.frequency.linearRampToValueAtTime(100, time + 0.3);

      gain.gain.setValueAtTime(0.3, time);
      gain.gain.linearRampToValueAtTime(0.2, time + 0.1);
      gain.gain.linearRampToValueAtTime(0, time + 0.4);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(time);
      osc.stop(time + 0.5);
  };

  const scheduleBeat = () => {
    if (isMuted || !audioCtxRef.current) return;
    
    const tempo = 110; 
    const secondsPerBeat = 60.0 / tempo;
    const lookahead = 25.0; // ms
    const scheduleAheadTime = 0.1; // s

    const schedule = () => {
        if (!isMusicPlayingRef.current || !audioCtxRef.current) return;
        
        const ctx = audioCtxRef.current;
        while (nextNoteTimeRef.current < ctx.currentTime + scheduleAheadTime) {
            const beat = beatCountRef.current % 16; 
            const time = nextNoteTimeRef.current;

            if (beat === 0 || beat === 2 || beat === 8 || beat === 14) {
                playKick(time);
            }
            if (beat === 4 || beat === 12) {
                playSnare(time);
            }
            if (beat % 2 === 0) {
                playHiHat(time, beat === 2); 
            } else if (beat === 15 || beat === 7) {
                playHiHat(time, false);
            }
            if (beat === 0) playBass(time, 55); 
            if (beat === 8) playBass(time, 55); 
            if (beat === 14) playBass(time, 82.4); 

            // --- MELODY ACCENTS (Random pentatonic) ---
            if (Math.random() > 0.9 && (beat === 0 || beat === 6)) {
                const freq = [392.00, 440.00, 523.25, 587.33][Math.floor(Math.random() * 4)];
                // Pluck
                const osc = ctx.createOscillator();
                const g = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, time);
                g.gain.setValueAtTime(0.05, time);
                g.gain.exponentialRampToValueAtTime(0.001, time + 0.5);
                osc.connect(g);
                g.connect(ctx.destination);
                osc.start(time);
                osc.stop(time + 0.5);
            }

            nextNoteTimeRef.current += secondsPerBeat / 4; 
            beatCountRef.current++;
        }
        
        schedulerTimerRef.current = setTimeout(schedule, lookahead);
    };
    
    schedule();
  };

  const toggleMute = () => {
      const nextMuteState = !isMuted;
      setIsMuted(nextMuteState);
      
      if (nextMuteState) {
          isMusicPlayingRef.current = false;
          if (schedulerTimerRef.current) clearTimeout(schedulerTimerRef.current);
          if(audioCtxRef.current) audioCtxRef.current.suspend();
      } else {
          if (audioCtxRef.current) {
              audioCtxRef.current.resume();
              if (!isMusicPlayingRef.current) {
                  isMusicPlayingRef.current = true;
                  nextNoteTimeRef.current = audioCtxRef.current.currentTime + 0.1;
                  scheduleBeat();
              }
          }
      }
  };

  const playSound = (type: 'correct' | 'wrong' | 'gameover') => {
    if (isMuted || !audioCtxRef.current) return;

    try {
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'correct') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, now);
          osc.frequency.exponentialRampToValueAtTime(1760, now + 0.1);
          gainNode.gain.setValueAtTime(0.1, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
          osc.start(now);
          osc.stop(now + 0.1);
      } else if (type === 'wrong') {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(150, now);
          osc.frequency.linearRampToValueAtTime(100, now + 0.2);
          gainNode.gain.setValueAtTime(0.1, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
          osc.start(now);
          osc.stop(now + 0.2);
      } else if (type === 'gameover') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(400, now);
          osc.frequency.exponentialRampToValueAtTime(50, now + 1);
          gainNode.gain.setValueAtTime(0.2, now);
          gainNode.gain.linearRampToValueAtTime(0, now + 1);
          osc.start(now);
          osc.stop(now + 1);
      }
    } catch (e) {
      console.warn("SFX error:", e);
    }
  };
  
  // --- Game Logic ---
  
  // 1. Enter Setup Mode
  const enterSetup = (level: number) => {
    setSelectedLevel(level);
    setGameState('setup');
    gameStateRef.current = 'setup';
  };

  // 2. Toggle Settings
  const toggleSetting = (key: keyof SettingsState) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // 3. Actually Start Game
  const launchGame = () => {
    const pool = currentPool.length > 0 ? currentPool : KATAKANA_DATA.seion; 
    if (pool.length === 0) return;

    initAudio();
    
    levelRef.current = selectedLevel;
    speedRef.current = selectedLevel === 1 ? 1.5 : selectedLevel === 2 ? 3.0 : 5.0;
    scoreRef.current = 0;
    livesRef.current = 5;
    tilesRef.current = [];
    activeIndexRef.current = 0;
    gameStateRef.current = 'playing';

    setScore(0);
    setLives(5);
    setTiles([]);
    setGameState('playing');
    
    // Initial Spawn
    spawnTile();
    
    lastTimeRef.current = performance.now();
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  const togglePause = () => {
    if (gameState === 'playing') {
        gameStateRef.current = 'paused';
        setGameState('paused');
        isMusicPlayingRef.current = false; // Stop music scheduling
        if (schedulerTimerRef.current) clearTimeout(schedulerTimerRef.current);
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        if (audioCtxRef.current) audioCtxRef.current.suspend();
    } else if (gameState === 'paused') {
        gameStateRef.current = 'playing';
        setGameState('playing');
        lastTimeRef.current = performance.now();
        requestRef.current = requestAnimationFrame(gameLoop);
        if (audioCtxRef.current && !isMuted) {
            audioCtxRef.current.resume();
            isMusicPlayingRef.current = true;
            nextNoteTimeRef.current = audioCtxRef.current.currentTime + 0.1;
            scheduleBeat(); // Restart music
        }
    }
  };

  const quitToMenu = () => {
      setGameState('menu');
      gameStateRef.current = 'menu';
      isMusicPlayingRef.current = false;
      if (schedulerTimerRef.current) clearTimeout(schedulerTimerRef.current);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (audioCtxRef.current) audioCtxRef.current.suspend();
  };

  // --- About Section Logic ---
  const openAbout = () => {
    // 1. Save where we came from
    prevGameStateRef.current = gameState;

    // 2. If playing, treat it like a PAUSE (stop loop/audio)
    if (gameState === 'playing') {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        if (schedulerTimerRef.current) clearTimeout(schedulerTimerRef.current);
        if (audioCtxRef.current) audioCtxRef.current.suspend();
        isMusicPlayingRef.current = false;
    }

    // 3. Switch to About screen
    gameStateRef.current = 'about';
    setGameState('about');
  };

  const closeAbout = () => {
    // 1. Retrieve previous state
    const targetState = prevGameStateRef.current;
    
    // 2. Restore State
    setGameState(targetState);
    gameStateRef.current = targetState;

    // 3. If we were playing, RESUME game loop and audio
    if (targetState === 'playing') {
        lastTimeRef.current = performance.now();
        requestRef.current = requestAnimationFrame(gameLoop);
        
        if (audioCtxRef.current && !isMuted) {
            audioCtxRef.current.resume();
            isMusicPlayingRef.current = true;
            nextNoteTimeRef.current = audioCtxRef.current.currentTime + 0.1;
            scheduleBeat();
        }
    }
  };

  const spawnTile = (startX?: number) => {
    // Use filtered pool based on settings
    const pool = currentPool.length > 0 ? currentPool : KATAKANA_DATA.seion; 
    const randomItem = pool[Math.floor(Math.random() * pool.length)];
    
    const isVert = orientation === 'vertical';
    const width = containerRef.current.width;
    
    let x, y;

    if (isVert) {
      // Mobile: Spawn at random X, fixed Top Y
      x = Math.random() * (width - tileWidthRef.current - 20) + 10;
      y = -tileWidthRef.current; 
    } else {
      // Desktop: Spawn at fixed Right X, random Y (centered somewhat)
      x = width + 50;
      // Center vertically somewhat
      y = (window.innerHeight / 3); 
    }
    
    const newTile: Tile = {
      id: Date.now() + Math.random(),
      ...randomItem,
      x: x,
      y: y,
      status: 'pending',
    };
    tilesRef.current.push(newTile);
    setTiles([...tilesRef.current]);
    
    // If this is the first active tile, generate options immediately
    if (tilesRef.current.length - 1 === activeIndexRef.current) {
      generateOptions(newTile);
    }
  };

  const generateOptions = (correctTile: Tile) => {
    if (!correctTile) return;
    
    let numChoices = 4;
    if (levelRef.current === 1) {
        if (scoreRef.current < 20) {
            numChoices = 2;
        } else if (scoreRef.current < 40) {
            numChoices = 3;
        } else {
            numChoices = 4;
        }
    }
    
    const pool = currentPool.length > 0 ? currentPool : KATAKANA_DATA.seion;
    // Filter out correct answer from pool to get distractors
    const availableDistractors = pool.filter(i => i.romaji !== correctTile.romaji);
    
    let distractors: CharData[] = [];
    // Handle small pool size edge case
    if (availableDistractors.length < numChoices - 1) {
        // If pool is too small, duplicate items just to fill UI
        while (distractors.length < numChoices - 1) {
            const randomItem = availableDistractors[Math.floor(Math.random() * availableDistractors.length)] || correctTile;
            distractors.push(randomItem);
        }
    } else {
        while (distractors.length < numChoices - 1) {
          const item = availableDistractors[Math.floor(Math.random() * availableDistractors.length)];
          if (!distractors.includes(item)) {
            distractors.push(item);
          }
        }
    }
    
    // Ensure correctTile is in the options by creating a fresh array
    const allOptions = [...distractors, correctTile].sort(() => Math.random() - 0.5);
    setOptions(allOptions);
  };

  const gameLoop = (time: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = time;
    lastTimeRef.current = time;

    if (gameStateRef.current !== 'playing') return;

    const isVert = orientation === 'vertical';
    
    // Move tiles
    tilesRef.current.forEach(tile => {
      if (isVert) {
        tile.y += speedRef.current; // Fall down
      } else {
        tile.x -= speedRef.current; // Move left
      }
    });

    // Spawn Check
    const lastTile = tilesRef.current[tilesRef.current.length - 1];
    const width = containerRef.current.width;
    const height = containerRef.current.height;
    
    let shouldSpawn = false;
    if (!lastTile) {
        shouldSpawn = true;
    } else {
        if (isVert) {
            // If last tile moved enough down
            if (lastTile.y > SPAWN_GAP) shouldSpawn = true;
        } else {
            // If last tile moved enough left (space created on right)
            if ((width - lastTile.x) > SPAWN_GAP) shouldSpawn = true;
        }
    }

    if (shouldSpawn) {
       spawnTile();
    }

    // Check Miss/Bounds
    const activeTile = tilesRef.current[activeIndexRef.current];
    if (activeTile && activeTile.status === 'pending') {
        // Desktop Check: x < 50
        // Mobile Check: y > height - 200 (approaching buttons)
        const missThreshold = isVert ? (height - 300) : 50; 
        
        // Condition for failure:
        // Desktop: x goes too small
        // Mobile: y goes too big
        const failed = isVert ? (activeTile.y > missThreshold) : (activeTile.x < missThreshold);

        if (failed) {
            activeTile.status = 'wrong';
            playSound('wrong');
            livesRef.current -= 1;
            setLives(livesRef.current); 

            if (livesRef.current <= 0) {
                endGame();
                return; 
            }
            
            activeIndexRef.current++;
            // Advance immediately
            if (activeIndexRef.current < tilesRef.current.length) {
                generateOptions(tilesRef.current[activeIndexRef.current]);
            } else {
                // Out of tiles but not dead? Wait for spawn logic (or force one?)
                // Usually spawn logic catches it.
            }
        }
    }

    // Cleanup old tiles
    if (tilesRef.current.length > 0) {
        const first = tilesRef.current[0];
        const outOfBounds = isVert ? (first.y > height + 100) : (first.x < -200);
        
        if (outOfBounds) {
             if (activeIndexRef.current > 0) {
                tilesRef.current.shift();
                activeIndexRef.current--;
            }
        }
    }

    setTiles([...tilesRef.current]);

    if (livesRef.current > 0 && gameStateRef.current === 'playing') {
      requestRef.current = requestAnimationFrame(gameLoop);
    }
  };

  const endGame = () => {
    playSound('gameover');
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    isMusicPlayingRef.current = false;
    if (schedulerTimerRef.current) clearTimeout(schedulerTimerRef.current);
    
    // Update high score
    if (score > highScore) {
        setHighScore(score);
        if (typeof window !== 'undefined') {
            localStorage.setItem('kana_highscore', score.toString());
        }
    }
    
    gameStateRef.current = 'gameover';
    setGameState('gameover');
  };

  const handleAnswer = (selectedRomaji: string) => {
    if (gameStateRef.current !== 'playing') return;

    const activeTile = tilesRef.current[activeIndexRef.current];
    if (!activeTile || activeTile.status !== 'pending') return;

    if (selectedRomaji === activeTile.romaji) {
      activeTile.status = 'correct';
      playSound('correct');
      scoreRef.current += 1;
      setScore(scoreRef.current);
      
      if (scoreRef.current % 5 === 0) {
          speedRef.current += 0.05;
      }
    } else {
      activeTile.status = 'wrong';
      playSound('wrong');
      livesRef.current -= 1;
      setLives(livesRef.current);

      if (livesRef.current <= 0) {
          endGame();
          return;
      }
    }

    activeIndexRef.current++;
    if (activeIndexRef.current < tilesRef.current.length) {
      generateOptions(tilesRef.current[activeIndexRef.current]);
    } else {
      // Force immediate spawn if user is faster than stream
      spawnTile();
      const newTile = tilesRef.current[activeIndexRef.current];
      if (newTile) generateOptions(newTile);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
          if (gameStateRef.current === 'playing' || gameStateRef.current === 'paused') {
              togglePause();
              return;
          }
      }

      if (gameStateRef.current !== 'playing') return;
      const keyMap: Record<string, number> = { '1': 0, '2': 1, '3': 2, '4': 3 };
      if (keyMap.hasOwnProperty(e.key) && options.length > 3) {
        handleAnswer(options[keyMap[e.key]].romaji);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [options, gameState]);

  // Resize & Orientation Check
  useEffect(() => {
    if (typeof window !== 'undefined') {
        const handleResize = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            containerRef.current = { width: w, height: h };
            
            // Determine layout
            const isMobile = w < 768; // Simple breakpoint
            setOrientation(isMobile ? 'vertical' : 'horizontal');
            tileWidthRef.current = isMobile ? 64 : 80;
        };
        
        handleResize(); // Init
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  useEffect(() => {
    return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        if (schedulerTimerRef.current) clearTimeout(schedulerTimerRef.current);
        if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  const getGridClass = (count: number) => {
      if (count === 2) return 'grid-cols-2 max-w-xl';
      if (count === 3) return 'grid-cols-3 max-w-3xl';
      return 'grid-cols-4 max-w-3xl';
  };

  return (
    <div className="h-screen w-full bg-slate-900 text-white font-sans overflow-hidden select-none relative flex flex-col touch-none">
      
      {/* --- LAYER 1: HUD --- */}
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
             {/* About Button - Calls openAbout instead of just setting state */}
             <button
              onClick={openAbout}
              className="p-2 sm:p-3 rounded-full transition-colors shadow-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex items-center justify-center"
            >
               <Info size={18} className="sm:w-5 sm:h-5" />
            </button>

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="p-2 sm:p-3 rounded-full transition-colors shadow-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex items-center justify-center"
              title={lang === 'en' ? "Switch to Sinhala" : "Switch to English"}
            >
               <Globe size={18} className={`sm:w-5 sm:h-5 ${lang === 'si' ? 'text-indigo-400' : ''}`} />
               <span className="ml-1.5 text-[10px] sm:text-xs font-bold">{lang === 'en' ? 'EN' : 'SI'}</span>
            </button>

            {(gameState === 'playing' || gameState === 'paused') && (
                <button 
                    onClick={togglePause}
                    className="p-2 sm:p-3 rounded-full transition-colors shadow-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300"
                    title={gameState === 'paused' ? "Resume Game" : "Pause Game"}
                >
                    {gameState === 'paused' ? <Play size={18} className="sm:w-5 sm:h-5" /> : <Pause size={18} className="sm:w-5 sm:h-5" />}
                </button>
            )}

            <button 
                onClick={toggleMute}
                className={`p-2 sm:p-3 rounded-full transition-colors shadow-lg border border-slate-700 ${isMuted ? 'bg-red-900/80 text-red-400' : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'}`}
                title={isMuted ? "Unmute Music & SFX" : "Mute Music & SFX"}
            >
                {isMuted ? <VolumeX size={18} className="sm:w-5 sm:h-5" /> : <Volume2 size={18} className="sm:w-5 sm:h-5" />}
            </button>
        </div>
      </div>

      {/* --- LAYER 2: GAME STREAM --- */}
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
                const isTarget = index === activeIndexRef.current && tile.status === 'pending';
                const size = tileWidthRef.current;
                
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

      {/* --- LAYER 3: GAMEPLAY CONTROLS --- */}
      {gameState === 'playing' && (
        <div className="absolute bottom-12 sm:bottom-16 left-0 w-full z-20 px-4 pb-safe">
            <div className={`mx-auto grid gap-3 sm:gap-6 ${getGridClass(options.length)} transition-all duration-500`}>
                {options.map((opt, idx) => (
                    <button
                        key={idx}
                        // Use onClick for unified handling, prevent default to stop double-firing on some touch devices
                        onClick={(e) => { 
                            e.preventDefault(); 
                            handleAnswer(opt.romaji); 
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
                {tiles.length > 0 && tiles[activeIndexRef.current] && (
                    <span className="ml-2 font-mono text-slate-400 font-bold border border-slate-700 px-2 py-0.5 rounded bg-slate-800">
                        {t.target}{tiles[activeIndexRef.current].char}
                    </span>
                )}
            </div>
        </div>
      )}

      {/* --- LAYER 4: MODALS --- */}
      
      {gameState === 'paused' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
             <div className="w-full max-w-xs bg-slate-800/90 rounded-3xl p-6 border border-slate-600 shadow-2xl text-center">
                <div className="text-white font-bold text-2xl mb-6 flex items-center justify-center gap-2">
                    <Pause size={24} /> {t.paused}
                </div>
                <div className="space-y-3">
                    <button onClick={togglePause} className="w-full p-4 bg-yellow-500 hover:bg-yellow-400 text-slate-900 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2">
                        <Play size={20} fill="currentColor" /> {t.resume}
                    </button>
                    <button onClick={quitToMenu} className="w-full p-4 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2">
                        <Home size={20} /> {t.quit}
                    </button>
                </div>
             </div>
        </div>
      )}

      {/* SETUP SCREEN (New) */}
      {gameState === 'setup' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-slate-800 rounded-3xl p-6 border border-slate-700 shadow-2xl flex flex-col animate-in slide-in-from-bottom-10">
             {/* Header */}
             <div className="flex items-center space-x-4 mb-6">
               <button onClick={() => setGameState('menu')} className="p-2 bg-slate-700 rounded-xl hover:bg-slate-600 transition-colors text-slate-300">
                  <ArrowLeft size={20} />
               </button>
               <h2 className="text-2xl font-bold text-white">{t.setupTitle}</h2>
             </div>

             {/* Toggles */}
             <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                <ModeToggle 
                  label={t.basicDesc(scriptMode === 'hiragana' ? 'Hiragana' : 'Katakana')} 
                  subLabel={`A-N`} // Simplified for mobile width
                  isActive={settings.seion} 
                  onClick={() => toggleSetting('seion')}
                  colorClass="blue"
                />
                <ModeToggle 
                  label={t.dakuten} 
                  subLabel={t.dakutenDesc} 
                  isActive={settings.dakuten} 
                  onClick={() => toggleSetting('dakuten')}
                  colorClass="green"
                />
                <ModeToggle 
                  label={t.combos} 
                  subLabel={t.combosDesc} 
                  isActive={settings.yoon} 
                  onClick={() => toggleSetting('yoon')}
                  colorClass="purple"
                />
             </div>

             {/* Info */}
             <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 text-center mb-6">
               <p className="text-slate-400 text-sm">{t.poolSize}</p>
               <p className="text-3xl font-bold text-white">{currentPool.length}</p>
             </div>

             {/* Start Action */}
             <button 
               onClick={launchGame}
               disabled={currentPool.length === 0}
               className={`w-full py-5 rounded-2xl font-bold text-xl flex items-center justify-center space-x-2 transition-all transform active:scale-95 shadow-lg
                 ${currentPool.length > 0 
                   ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-900/20 border-b-4 border-blue-800 active:border-b-0 active:translate-y-1' 
                   : 'bg-slate-700 text-slate-500 cursor-not-allowed border-b-4 border-slate-800'}`}
             >
               <span>{t.startStream}</span>
               <Play size={24} fill="currentColor" />
             </button>
          </div>
        </div>
      )}

      {/* ABOUT SCREEN (New) */}
      {gameState === 'about' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-slate-800 rounded-3xl p-6 border border-slate-700 shadow-2xl flex flex-col animate-in zoom-in duration-200">
             {/* Header - Calls closeAbout to handle resume logic */}
             <div className="flex items-center space-x-4 mb-6">
               <button onClick={closeAbout} className="p-2 bg-slate-700 rounded-xl hover:bg-slate-600 transition-colors text-slate-300">
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
      )}

      {gameState === 'menu' && (
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
                     onClick={() => setScriptMode('katakana')}
                     className={`flex-1 py-2 sm:py-3 rounded-lg font-bold text-xs sm:text-sm transition-all ${scriptMode === 'katakana' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-400 hover:text-slate-300'}`}
                   >
                     Katakana (ア)
                   </button>
                   <button 
                     onClick={() => setScriptMode('hiragana')}
                     className={`flex-1 py-2 sm:py-3 rounded-lg font-bold text-xs sm:text-sm transition-all ${scriptMode === 'hiragana' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-300'}`}
                   >
                     Hiragana (あ)
                   </button>
                </div>

                <div className="space-y-3">
                    <button onClick={() => enterSetup(1)} className="w-full p-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-lg shadow-lg border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2">
                        <Play size={20} /> {t.normal}
                        <span className="text-xs opacity-75 font-normal hidden sm:inline">{t.beginner}</span>
                    </button>
                    <button onClick={() => enterSetup(2)} className="w-full p-4 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold text-lg shadow-lg border-b-4 border-purple-800 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2">
                        <Zap size={20} /> {t.fast}
                    </button>
                    <button onClick={() => enterSetup(3)} className="w-full p-4 bg-rose-600 hover:bg-rose-500 rounded-xl font-bold text-lg shadow-lg border-b-4 border-rose-800 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2">
                        <Zap size={20} fill="currentColor" /> {t.insane}
                    </button>
                </div>
            </div>
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-red-900/20 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm bg-slate-800 rounded-3xl p-8 border-2 border-red-500/50 shadow-2xl text-center animate-in zoom-in duration-300">
                <div className="text-6xl mb-4 animate-bounce">💀</div>
                <h2 className="text-3xl font-bold text-white mb-2">{t.streamLost}</h2>
                <p className="text-slate-400 mb-6">{t.score}<span className="text-yellow-400 font-mono text-2xl font-bold">{score}</span></p>
                
                <button onClick={() => setGameState('menu')} className="w-full px-8 py-4 bg-green-600 hover:bg-green-500 rounded-xl font-bold text-xl shadow-lg border-b-4 border-green-800 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2">
                    <RotateCcw size={20} /> {t.tryAgain}
                </button>
            </div>
        </div>
      )}

    </div>
  );
}
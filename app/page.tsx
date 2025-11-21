'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  CharData,
  Tile,
  SettingsState,
  GameState,
  Language,
  ScriptType,
  Orientation
} from './types';
import { KATAKANA_DATA, HIRAGANA_DATA } from './data/kana';
import { TRANSLATIONS } from './data/translations';
import { useAudio } from './hooks/useAudio';

// Components
import { GameHUD } from './components/game/GameHUD';
import { GameStream } from './components/game/GameStream';
import { GameControls } from './components/game/GameControls';
import { PauseModal } from './components/game/PauseModal';
import { MainMenuScreen } from './components/screens/MainMenu';
import { SetupScreen } from './components/screens/SetupScreen';
import { AboutScreen } from './components/screens/AboutScreen';
import { GameOverScreen } from './components/screens/GameOverScreen';

// --- Constants ---
const SPAWN_GAP = 160;

export default function KanaStream() {
  // UI State
  const [gameState, setGameState] = useState<GameState>('menu');
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(5);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [options, setOptions] = useState<CharData[]>([]);
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

  // Audio Hook
  const { isMuted, initAudio, toggleMute, playSound, stopAudio, resumeAudio } = useAudio();

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
      stopAudio();
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    } else if (gameState === 'paused') {
      gameStateRef.current = 'playing';
      setGameState('playing');
      lastTimeRef.current = performance.now();
      requestRef.current = requestAnimationFrame(gameLoop);
      resumeAudio();
    }
  };

  const quitToMenu = () => {
    setGameState('menu');
    gameStateRef.current = 'menu';
    stopAudio();
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
  };

  // --- About Section Logic ---
  const openAbout = () => {
    // 1. Save where we came from
    prevGameStateRef.current = gameState;

    // 2. If playing, treat it like a PAUSE (stop loop/audio)
    if (gameState === 'playing') {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      stopAudio();
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
      resumeAudio();
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
    stopAudio();

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
      stopAudio();
    };
  }, []);

  return (
    <div className="h-screen w-full bg-slate-900 text-white font-sans overflow-hidden select-none relative flex flex-col touch-none">

      {/* --- LAYER 1: HUD --- */}
      <GameHUD
        score={score}
        lives={lives}
        gameState={gameState}
        lang={lang}
        isMuted={isMuted}
        onOpenAbout={openAbout}
        onToggleLanguage={toggleLanguage}
        onTogglePause={togglePause}
        onToggleMute={toggleMute}
      />

      {/* --- LAYER 2: GAME STREAM --- */}
      <GameStream
        tiles={tiles}
        orientation={orientation}
        activeIndex={activeIndexRef.current}
        tileWidth={tileWidthRef.current}
        t={t}
      />

      {/* --- LAYER 3: GAMEPLAY CONTROLS --- */}
      {gameState === 'playing' && (
        <GameControls
          options={options}
          tiles={tiles}
          activeIndex={activeIndexRef.current}
          onAnswer={handleAnswer}
          t={t}
        />
      )}

      {/* --- LAYER 4: MODALS --- */}

      {gameState === 'paused' && (
        <PauseModal
          t={t}
          onResume={togglePause}
          onQuit={quitToMenu}
        />
      )}

      {/* SETUP SCREEN */}
      {gameState === 'setup' && (
        <SetupScreen
          t={t}
          settings={settings}
          scriptMode={scriptMode}
          poolSize={currentPool.length}
          onBack={() => setGameState('menu')}
          onToggleSetting={toggleSetting}
          onLaunch={launchGame}
        />
      )}

      {/* ABOUT SCREEN */}
      {gameState === 'about' && (
        <AboutScreen
          t={t}
          onClose={closeAbout}
        />
      )}

      {gameState === 'menu' && (
        <MainMenuScreen
          t={t}
          highScore={highScore}
          scriptMode={scriptMode}
          onSetScriptMode={setScriptMode}
          onEnterSetup={enterSetup}
        />
      )}

      {gameState === 'gameover' && (
        <GameOverScreen
          t={t}
          score={score}
          onTryAgain={() => setGameState('menu')}
        />
      )}

    </div>
  );
}
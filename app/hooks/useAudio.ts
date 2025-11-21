import { useRef, useState, useEffect } from 'react';

export const useAudio = () => {
    const audioCtxRef = useRef<AudioContext | null>(null);
    const nextNoteTimeRef = useRef<number>(0);
    const beatCountRef = useRef<number>(0);
    const isMusicPlayingRef = useRef<boolean>(false);
    const schedulerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [isMuted, setIsMuted] = useState<boolean>(false);

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
            if (audioCtxRef.current) audioCtxRef.current.suspend();
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

    const stopAudio = () => {
        isMusicPlayingRef.current = false;
        if (schedulerTimerRef.current) clearTimeout(schedulerTimerRef.current);
        if (audioCtxRef.current) audioCtxRef.current.suspend();
    };

    const resumeAudio = () => {
        if (audioCtxRef.current && !isMuted) {
            audioCtxRef.current.resume();
            isMusicPlayingRef.current = true;
            nextNoteTimeRef.current = audioCtxRef.current.currentTime + 0.1;
            scheduleBeat();
        }
    };

    useEffect(() => {
        return () => {
            if (schedulerTimerRef.current) clearTimeout(schedulerTimerRef.current);
            if (audioCtxRef.current) audioCtxRef.current.close();
        };
    }, []);

    return {
        isMuted,
        initAudio,
        toggleMute,
        playSound,
        stopAudio,
        resumeAudio
    };
};

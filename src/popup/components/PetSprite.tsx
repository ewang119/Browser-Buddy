import { useState, useEffect, useRef } from 'react';
import '../styles/MainScreen.css';
import { PetData } from '../types';

interface PetSpriteProps {
    petData: PetData;
    setPetData: React.Dispatch<React.SetStateAction<PetData>>;
}

// Constants for durations
const POMODORO_WORK_MS = 25 * 1 * 1000;
const POMODORO_BREAK_MS = 5 * 1 * 1000;
const TRADITIONAL_WORK_MS = 45 * 1 * 1000;
const TRADITIONAL_BREAK_MS = 5 * 1 * 1000;
const STAT_CHANGE_AMOUNT = 15;
const BONUS_REWARD = 30;

const BREAK_MESSAGES = {
    DEFAULT: 'Breaks are important!',
    TRADITIONAL: 'Time to take a break! Park your cursor to care for your pet!',
    POMODORO: 'You earned a break! Your pet wants to play.',
    PENALTY: 'Your pet is exhausted! Take a break!'
};

/* RNG for bonuses */
const getRandomFactor = () => Math.round((0.5 + Math.random()) * 100) / 100;

export default function PetSprite({ petData, setPetData }: PetSpriteProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [mode, setMode] = useState<'pomodoro' | 'traditional'>('traditional');
    const [pomodoroCount, setPomodoroCount] = useState(0);
    const [breakMessage, setBreakMessage] = useState(BREAK_MESSAGES.DEFAULT);
    const petDataRef = useRef(petData);
    const penaltyRef = useRef(false);
    const pomodoroCountRef = useRef(pomodoroCount);

    // Keep refs in sync
    useEffect(() => {
        petDataRef.current = petData;
    }, [petData]);

    useEffect(() => {
        pomodoroCountRef.current = pomodoroCount;
    }, [pomodoroCount]);

    // Main timer logic
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            const current = petDataRef.current;

            const workDuration = mode === 'pomodoro' ? POMODORO_WORK_MS : TRADITIONAL_WORK_MS;
            const breakDuration = mode === 'pomodoro' ? POMODORO_BREAK_MS : TRADITIONAL_BREAK_MS;

            
            // Check for penalty
            if (now - current.lastBreak >= 2 * workDuration && !penaltyRef.current) {
                setPetData(prev => ({
                    ...prev,
                    HP: Math.max(prev.HP - 25, 0),
                    morale: Math.max(prev.morale - 25, 0),
                }));
                penaltyRef.current = true;
            }

            // Break completed
            if (isHovered && current.isOnBreak && now >= current.lastBreak + breakDuration) {
                handleBreakComplete();
            }

            // Break aborted
            else if (!isHovered && current.isOnBreak) {
                abortBreak();
            }

            // On break (show timer)
            else if (current.isOnBreak) {
                const remaining = Math.max(0, Math.ceil((current.lastBreak + breakDuration - now) / 1000));
                setBreakMessage(
                    mode === 'pomodoro'
                        ? `Enjoy your break! Leave your cursor for: ${remaining}s`
                        : `Take a break! Leave your cursor for: ${remaining}s`
                );
            }

            // Work session ongoing
            else if (!current.isOnBreak && now < current.nextBreak) {
                const mins = Math.max(0, Math.ceil((current.nextBreak - now) / 1000 ));
                if (penaltyRef.current) {
                    setBreakMessage(BREAK_MESSAGES.PENALTY);
                } else {
                    setBreakMessage(
                        mode === 'pomodoro'
                            ? `You are on Pomodoro Grind #${pomodoroCountRef.current + 1}. Next break in: ${mins}s`
                            : `Next break in: ${mins}s`
                    );
                }
            }

            // Time for break but user hasn't hovered
            else if (!isHovered && !current.isOnBreak && now >= current.nextBreak) {
                if (penaltyRef.current) {
                    setBreakMessage(BREAK_MESSAGES.PENALTY);
                } else {
                    setBreakMessage(mode === 'pomodoro' ? BREAK_MESSAGES.POMODORO : BREAK_MESSAGES.TRADITIONAL);
                }
            }

            // Start break on hover
            else if (isHovered && !current.isOnBreak && now >= current.nextBreak) {
                startBreak();
            }

        }, 400);

        return () => clearInterval(interval);
    }, [isHovered, mode]);

    // Handle successful break
    const handleBreakComplete = () => {
        penaltyRef.current = false;
        setPetData(prev => {
            const now = Date.now();
            const newXP = Math.min(prev.XP + Math.round(STAT_CHANGE_AMOUNT * getRandomFactor()), 100) * Math.floor(prev.morale / 100);
            const shouldPrestige = newXP >= 100;
            const updated = {
                ...prev,
                isOnBreak: false,
                lastBreak: now,
                nextBreak: now + (mode === 'pomodoro' ? POMODORO_WORK_MS : TRADITIONAL_WORK_MS),
                HP: Math.min(prev.HP + Math.round(STAT_CHANGE_AMOUNT * getRandomFactor()), 100),
                morale: Math.min(prev.morale + Math.round(STAT_CHANGE_AMOUNT * getRandomFactor()), 100),
                XP: shouldPrestige ? newXP - 100 : newXP,
                prestige: shouldPrestige ? prev.prestige + 1 : prev.prestige,
                coins: prev.coins + 20 * Math.floor(prev.morale / 100),
            };

            if (mode === 'pomodoro') {
                const nextPomodoro = pomodoroCountRef.current + 1;
                setPomodoroCount(nextPomodoro);
                if (nextPomodoro >= 4) {
                    setMode('traditional');
                    setPomodoroCount(0);
                    updated.XP = Math.min(100, updated.XP + BONUS_REWARD);
                    updated.coins += 50;
                }
            }

            updateIcon();
            return updated;
        });
    };

    // Handle early exit from break
    const abortBreak = () => {
        setPetData(prev => {
            const now = Date.now();
            const updated = {
                ...prev,
                isOnBreak: false,
                lastBreak: now,
                nextBreak: now + (mode === 'pomodoro' ? POMODORO_WORK_MS : TRADITIONAL_WORK_MS),
                HP: Math.max(prev.HP - Math.round(STAT_CHANGE_AMOUNT * getRandomFactor()), 0),
                morale: Math.max(prev.morale - Math.round(STAT_CHANGE_AMOUNT * getRandomFactor()), 0),
            };

            // Still progress Pomodoro
            if (mode === 'pomodoro') {
                const nextPomodoro = pomodoroCountRef.current + 1;
                setPomodoroCount(nextPomodoro);
                if (nextPomodoro >= 4) {
                    setMode('traditional');
                    setPomodoroCount(0);
                }
            }

            updateIcon();
            return updated;
        });
    };

    // Start a new break
    const startBreak = () => {
        penaltyRef.current = false;
        setPetData(prev => {
            const now = Date.now();
            updateIcon();
            return {
                ...prev,
                isOnBreak: true,
                lastBreak: now
            };
        });
    };

    // Toggle modes
    const toggleMode = () => {
        setMode(prev => {
            const newMode = prev === 'pomodoro' ? 'traditional' : 'pomodoro';
            setPetData(prevData => ({
                ...prevData,
                nextBreak: Date.now() + (newMode === 'pomodoro' ? POMODORO_WORK_MS : TRADITIONAL_WORK_MS),
                lastBreak: Date.now(),
                isOnBreak: false
            }));
            setPomodoroCount(0);
            return newMode;
        });
    };

    const updateIcon = () => {
        chrome.runtime.sendMessage({ type: 'SET_ICON' });
    };

    return (
        <div className="pet-sprite-container">
            <img
                src={`/animal-gifs/${petData.animalType}.gif`}
                alt={`${petData.animalType} pet`}
                className={`pet-img ${petData.isOnBreak ? 'break-glow' : ''}`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{ borderRadius: '10%' }}
            />
            <p className="break-timer">{breakMessage}</p>
            <button className="mode-toggle" onClick={toggleMode}>
                Mode: {mode === 'pomodoro' ? 'Pomodoro' : 'Traditional'}
            </button>
        </div>
    );
}

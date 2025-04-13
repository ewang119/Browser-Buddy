import { useState, useEffect, useRef } from 'react';
import '../styles/MainScreen.css';
import { PetData } from '../types';

interface PetSpriteProps {
    petData: PetData;
    setPetData: React.Dispatch<React.SetStateAction<PetData>>;
}

// Constants for durations
const POMODORO_WORK_MS = 10 * 1 * 1000;
const POMODORO_BREAK_MS = 5 * 1 * 1000;
const TRADITIONAL_WORK_MS = 10 * 1 * 1000;
const TRADITIONAL_BREAK_MS = 5 * 1 * 1000;
const STAT_CHANGE_AMOUNT = 15;
const BONUS_REWARD = 30;

const BREAK_MESSAGES = {
    DEFAULT: 'Breaks are important!',
    TRADITIONAL: 'Time to take a break! Park your cursor to care for your pet!',
    POMODORO: 'You earned a break! Your pet wants to play.',
    PENALTY: 'Your pet is exhausted! Take a break!'
};

export default function PetSprite({ petData, setPetData }: PetSpriteProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [mode, setMode] = useState<'pomodoro' | 'traditional'>('traditional');
    const [pomodoroCount, setPomodoroCount] = useState(0);
    const [breakMessage, setBreakMessage] = useState(BREAK_MESSAGES.DEFAULT);
    const petDataRef = useRef(petData);
    const penaltyRef = useRef(false);

    // Keep the ref synced with latest state
    useEffect(() => {
        petDataRef.current = petData;
    }, [petData]);

    /* for debugging */
    useEffect(() => {
        const now = Date.now();
        setPetData(prev => ({
            ...prev,
            lastBreak: now,
            nextBreak: now + 10 * 1000, // 10 seconds from now
        }));
    }, []);

    // Main interval logic
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            const current = petDataRef.current;

            const workDuration = mode === 'pomodoro' ? POMODORO_WORK_MS : TRADITIONAL_WORK_MS;
            const breakDuration = mode === 'pomodoro' ? POMODORO_BREAK_MS : TRADITIONAL_BREAK_MS;

            // Start break when conditions are met
            if (isHovered && !current.isOnBreak && now >= current.nextBreak) {
                penaltyRef.current = false;
                startBreak();
            }
            
            // Still on break
            if (current.isOnBreak) {
                const remaining = Math.max(0, Math.ceil((current.lastBreak + breakDuration - now) / 1000));
                if (mode === 'pomodoro') {
                    setBreakMessage(`Enjoy your break!. Leave your cursor for: ${remaining}s`);
                } else {
                    setBreakMessage(`Take a break! Leave your cursor for: ${remaining}s`);
                }
            }

            // Penalize if they haven't taken a break in time
            else if (!current.isOnBreak && now - current.lastBreak >= 2 * workDuration && !penaltyRef.current) {
                setPetData(prev => ({
                    ...prev,
                    HP: Math.max(prev.HP - 25, 0),
                    morale: Math.max(prev.morale - 25, 0),
                }));
                penaltyRef.current = true;
            }

            // Notify when work session expires
            if (!isHovered && !current.isOnBreak && now >= current.nextBreak) {
                setBreakMessage(mode === 'pomodoro' ? BREAK_MESSAGES.POMODORO : BREAK_MESSAGES.TRADITIONAL);
            }

            // Penalty message
            else if (penaltyRef.current === true) {
                setBreakMessage(BREAK_MESSAGES.PENALTY);
            }
            
            // Ongoing work session
            else if (!current.isOnBreak && now < current.nextBreak) {
                const mins = Math.max(0, Math.ceil((current.nextBreak - now) / 1000));
                if (mode === 'pomodoro') {
                    setBreakMessage(`You are on Pomodoro Grind #${pomodoroCount + 1}. Next break in: ${mins}s`);
                } else {
                    setBreakMessage(`Next break in: ${mins}s`);
                }
            }
            // Break fully completed
            else if (isHovered && current.isOnBreak && now >= current.lastBreak + breakDuration) {
                handleBreakComplete();
            }
            // Break aborted
            else if (!isHovered && current.isOnBreak) {
                abortBreak();
            }
        }, 400);

        return () => clearInterval(interval);
    }, [isHovered, mode]);

    // Handle successful break completion
    const handleBreakComplete = () => {
        penaltyRef.current = false;
        setPetData(prev => {
            const now = Date.now();
            const newXP = Math.min(prev.XP + STAT_CHANGE_AMOUNT, 100);
            const shouldPrestige = newXP >= 100;
            const updated = {
                ...prev,
                isOnBreak: false,
                lastBreak: now,
                nextBreak: now + (mode === 'pomodoro' ? POMODORO_WORK_MS : TRADITIONAL_WORK_MS),
                HP: Math.min(prev.HP + STAT_CHANGE_AMOUNT, 100),
                morale: Math.min(prev.morale + STAT_CHANGE_AMOUNT, 100),
                XP: shouldPrestige ? newXP - 100 : newXP,
                prestige: shouldPrestige ? prev.prestige + 1 : prev.prestige,
                coins: prev.coins + 20,
            };

            if (mode === 'pomodoro') {
                const nextPomodoro = pomodoroCount + 1;
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

    // Handle break cancellation
    const abortBreak = () => {
        setPetData(prev => {
            const now = Date.now();
            updateIcon();
            return {
                ...prev,
                isOnBreak: false,
                lastBreak: now,
                nextBreak: now + (mode === 'pomodoro' ? POMODORO_WORK_MS : TRADITIONAL_WORK_MS),
                HP: Math.max(prev.HP - STAT_CHANGE_AMOUNT, 0),
                morale: Math.max(prev.morale - STAT_CHANGE_AMOUNT, 0),
                XP: Math.max(prev.XP - STAT_CHANGE_AMOUNT, 0),
            };
        });
    };

    // Begin a new break session
    const startBreak = () => {
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

    // Toggle timer mode and reset state
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
            />
            <p className="break-timer">{breakMessage}</p>
            <button className="mode-toggle" onClick={toggleMode}>
                Mode: {mode === 'pomodoro' ? 'Pomodoro' : 'Traditional'}
            </button>
        </div>
    );
}

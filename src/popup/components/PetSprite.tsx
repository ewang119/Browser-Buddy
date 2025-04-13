import { useState, useEffect, useRef } from 'react';
import '../styles/MainScreen.css';
import { PetData } from '../types';

interface MainScreenProps {
    petData: PetData;
    setPetData: React.Dispatch<React.SetStateAction<PetData>>;
}

const BREAK_DURATION_MS = 60 * 1000;       // 10 seconds (for testing)
const NEXT_BREAK_DELAY_MS = 30 * 60 * 1000;     // 20 seconds until next break
const STAT_CHANGE_AMOUNT = 15;

export default function PetSprite({ petData, setPetData }: MainScreenProps) {
    const [isHovered, setIsHovered] = useState(false);
    const petDataRef = useRef(petData);  // ✅ stores always-up-to-date petData
    const penaltyRef = useRef(false);

    // Keep the ref synced with latest state
    useEffect(() => {
        petDataRef.current = petData;
    }, [petData]);

    // Main interval logic
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            const current = petDataRef.current;


            // Penalize if they haven't taken a break in over an hour
            if ( !current.isOnBreak && now - current.lastBreak >= 60 * 60 * 1000 && !penaltyRef.current) {
                console.log('⚠️ No break in over an hour. Applying penalty.');
                setPetData(prev => {
                    const updated = {
                        ...prev,
                        HP: Math.max(prev.HP - 25, 0),
                        morale: Math.max(prev.morale - 25, 0),
                    };
                    setTimeout(() => updateIcon(), 0);
                    return updated;
                });
                penaltyRef.current = true;
            }


            // Start break when conditions are met
            if (isHovered && !current.isOnBreak && now >= current.nextBreak) {
                startBreak();
            }

            // Complete break if the duration has passed
            else if (isHovered && current.isOnBreak && now >= current.lastBreak + BREAK_DURATION_MS) {
                handleBreakComplete();
            }

            // Abort break if user leaves early
            else if (!isHovered && current.isOnBreak) {
                abortBreak();
            }
        }, 300); // check 3x per second

        return () => clearInterval(interval);
    }, [isHovered]);

    // Handle successful break completion
    const handleBreakComplete = (): PetData => {
        let updatedData: PetData;

        penaltyRef.current = false;

        setPetData(prev => {
            const now = Date.now();
            const newXP = Math.min(prev.XP + STAT_CHANGE_AMOUNT, 100);
            const shouldPrestige = newXP >= 100;

            updatedData = {
                ...prev,
                isOnBreak: false,
                lastBreak: now,
                nextBreak: now + NEXT_BREAK_DELAY_MS,
                HP: Math.min(prev.HP + STAT_CHANGE_AMOUNT, 100),
                morale: Math.min(prev.morale + STAT_CHANGE_AMOUNT, 100),
                XP: shouldPrestige ? newXP - 100 : newXP,
                prestige: shouldPrestige ? prev.prestige + 1 : prev.prestige,
                coins: prev.coins + 20,
            };

            setTimeout(() => updateIcon(), 0);
            return updatedData;
        });

        return updatedData!;
    };

    // Handle break cancellation
    const abortBreak = (): PetData => {
        let updatedData: PetData;

        setPetData(prev => {
            const now = Date.now();
            updatedData = {
                ...prev,
                isOnBreak: false,
                lastBreak: now,
                nextBreak: now + NEXT_BREAK_DELAY_MS,
                HP: Math.max(prev.HP - STAT_CHANGE_AMOUNT, 0),
                morale: Math.max(prev.morale - STAT_CHANGE_AMOUNT, 0),
                XP: Math.max(prev.XP - STAT_CHANGE_AMOUNT, 0),
                prestige: prev.prestige
            };

            setTimeout(() => updateIcon(), 0);
            return updatedData;
        });

        return updatedData!;
    };

    // Begin a new break session
    const startBreak = (): PetData => {
        let updatedData: PetData;

        setPetData(prev => {
            const now = Date.now();
            updatedData = {
                ...prev,
                isOnBreak: true,
                lastBreak: now
            };

            setTimeout(() => updateIcon(), 0);
            return updatedData;
        });

        return updatedData!;
    };

    // Chrome icon update
    const updateIcon = () => {
        chrome.runtime.sendMessage({ type: 'SET_ICON' });
    };

    // Hover listeners
    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    return (
        <img
            src={`/animal-gifs/${petData.animalType}.gif`}
            alt={`${petData.animalType} pet`}
            className={`pet-img ${petData.isOnBreak ? 'break-glow' : ''}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        />
    );
}

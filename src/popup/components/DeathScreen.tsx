import { PetData, animals } from "../types";
import { useState, useEffect } from 'react'
import styles from '../styles/Death.module.css'

interface deathProps {
  petData: PetData;
  setPetData: (data: PetData) => void;
}

export default function DeathScreen({petData, setPetData}: deathProps) {
    const [newName, setNewName] = useState('');
    const random = Math.floor(Math.random() * 8);
    
    const [showLightning, setShowLightning] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setShowLightning(false), 1000);
        return () => clearTimeout(timer);
    }, []);


    const handleRestart = () => {
        const now = Date.now()
        setPetData({
            animalType: animals[random].type,
            name: newName,
            lastBreak: now,
            nextBreak: now + 3600000,
            budget: 0,
            coins: 0,
            goals: [],
            streaks: 0,
            prestige: 0,
            HP: 100,
            morale: 100,
            XP: 0,
            highScore: Math.max(petData.highScore, petData.prestige),
            lastXPReset: now,
            timerState: {
                timeLeft: 25 * 60,
                isRunning: false,
                isBreak: false,
                sessionCompleted: false,
                lastBreakTime: now,
                lastUpdate: now
            }
        })
    }
    

    return (
        <div className={styles.deathScreen}>
            {showLightning && <img src="/light.png" className="lightning-bolt" />}
            
            <img src="/grave.png" className={styles.graveImage}/>
            <h2>You Died LMAOO</h2>
            <h3>As punishment, we are randomly choosing the {animals[random].type} as your next pet.</h3>
            <h3>You can enter the name at least below</h3>

            <label>
                You can enter name
                <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Mochi"
                />
            </label>

            <button onClick={handleRestart}>Start New Life</button>
        </div>
    );
}
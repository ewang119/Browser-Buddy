import { PetData, animals } from "../types";
import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Death.module.css'

interface deathProps {
  petData: PetData;
  setPetData: (data: PetData) => void;
}

export default function DeathScreen({petData, setPetData}: deathProps) {
    const [newName, setNewName] = useState('');
    const random = Math.floor(Math.random() * 8);
    const navigate = useNavigate();

    const handleRestart = () => {
        const now = Date.now()
        setPetData({
            animalType: animals[random].type,
            name: newName,
            lastBreak: now,
            nextBreak: now + 3600000,
            isOnBreak: false,
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
        });
        setTimeout(() => {
            navigate('/');
          }, 100);     
        }
    

    return (
        <div className={styles.deathScreen}>         
            <img src="/grave.png" className={styles.graveImage}/>
            <h2>💀 {petData.name} died 💀</h2>
            <h3>Your high score is: {Math.max(petData.highScore, petData.prestige)}</h3>
            <h3>As punishment, we are randomly choosing the {animals[random].type} as your next pet.</h3>

            <label>
                You can enter name
                <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Mochi"
                />
            </label>

            <button onClick={handleRestart}>Start New</button>
        </div>
    );
}
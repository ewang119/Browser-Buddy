import { useEffect, useState } from 'react'
import { PetData } from '../types'
import '../styles/MainScreen.css'

import PetSprite from './PetSprite'

interface MainScreenProps {
  petData: PetData;
  setPetData: React.Dispatch<React.SetStateAction<PetData>>
}

const BREAK_DURATION_MS = 60 * 1000;
const HP_COLORS = {
  HIGH: '#4caf50', // green
  MEDIUM: '#ffeb3b', // yellow
  LOW: '#f44336', // red
  DEFAULT: '#6ac6ff' // default blue
};

const BREAK_MESSAGES = {
  TAKE_BREAK: 'Breaks are important!',
  TIME_TO_BREAK: 'Time to take a break! Park your cursor to care for your pet!',
  PENALTY: 'Your pet is exhausted! Take a break!'
};

export default function MainScreen({ petData, setPetData }: MainScreenProps) {

  // Time left on your break
  const [breakMessage, setBreakMessage] = useState(BREAK_MESSAGES.TAKE_BREAK);

  // Timer to handle break triggering and countdown
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
  
      if (petData.isOnBreak) {
        const breakStart = petData.lastBreak;
        const remaining = Math.max(0, Math.ceil((breakStart + BREAK_DURATION_MS - now) / 1000));
        setBreakMessage(`Take a break! Leave your cursor for: ${remaining}s`);
      } 

      else if (petData.nextBreak <= now - 3600000) {
        setBreakMessage(BREAK_MESSAGES.PENALTY);   
      }
      
      else if (petData.nextBreak <= now) {
        setBreakMessage(BREAK_MESSAGES.TIME_TO_BREAK);   
      }
      
      else {
        const mins = Math.max(0, Math.ceil((petData.nextBreak - now) / 1000 / 60));
        setBreakMessage(`Next break in: ${mins} minute${mins !== 1 ? 's' : ''}`);
      }
    }, 1000);

    return () => clearInterval(interval)
  }, [petData])


  return (
    <div className="main-screen">
      <h1>{petData.name}</h1>

      <PetSprite petData={petData} setPetData={setPetData} />

      <p className="break-timer">{breakMessage}</p>

      <div className="stats">
        <ProgressBar label="HP" value={petData.HP} />
        <ProgressBar label="Morale" value={petData.morale} />
        <ProgressBar label="XP" value={petData.XP} />
      </div>

      <div className="actions">
        <button>[SHOP]</button>
        <button>[INVENTORY]</button>
        <button>[ENTER DOGFIGHT]</button>
      </div>

      <div className="footer">
        <span>Coins: {petData.coins}</span>
        <span>Prestige: {petData.prestige}</span>
      </div>
    </div>
  )
}

// ProgressBar component to show pet stats
const ProgressBar = ({
  label,
  value
}: {
  label: string
  value: number
}) => {
  let backgroundColor = HP_COLORS.DEFAULT;

  if (label === 'HP' || label === 'Morale') {
    if (value > 70) backgroundColor = HP_COLORS.HIGH;
    else if (value > 30) backgroundColor = HP_COLORS.MEDIUM;
    else backgroundColor = HP_COLORS.LOW;
  }

  return (
    <div className="bar">
      <span>{label}</span>
      <div className="track">
        <div
          className="fill"
          style={{
            width: `${value}%`,
            backgroundColor
          }}
        />
      </div>
    </div>
  )
}

// src/popup/components/MainScreen.tsx
import { useState } from 'react'
import { PetData } from '../types'
import TarotDraw from './TarotDraw'
import WelcomePopup from './WelcomePopup'
import '../styles/MainScreen.css'
import { useNavigate } from 'react-router-dom'
interface MainScreenProps {
  petData: PetData;
  setPetData: (data: PetData) => void;
}

export default function MainScreen({ petData, setPetData }: MainScreenProps) {
  const [showTarot, setShowTarot] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  const toggleGoal = (index: number) => {
    const newGoals = [...petData.goals]
    newGoals[index].completed = !newGoals[index].completed
    setPetData({ ...petData, goals: newGoals })
  }

  const ProgressBar = ({ label, value }: { label: string; value: number }) => (
    <div className="bar">
      <span>{label}</span>
      <div className="track">
        <div className="fill" style={{ width: `${value}%` }} />
      </div>
    </div>
  )
  const navigate = useNavigate()
  return (
    <div className="main-screen">
      
      {showWelcome && (
        <WelcomePopup 
          petData={petData} 
          onClose={() => setShowWelcome(false)} 
        />
      )}

      <h2 className="header">Lv. 1 {petData.name}</h2>

      <img
        src={`/animal-gifs/${petData.animalType}.gif`}
        alt={`${petData.animalType} pet`}
        className="pet-img"
      />

      <div className="stats">
        <ProgressBar label="HP" value={petData.HP} />
        <ProgressBar label="Morale" value={petData.morale} />
        <ProgressBar label="XP" value={petData.XP} />
      </div>

      <div className="goals">
        <h3>Goals</h3>
        <ul>
          {petData.goals.map((goal: any, i: number) => (
            <li key={i}>
              <label>
                <input
                  type="checkbox"
                  checked={goal.completed}
                  onChange={() => toggleGoal(i)}
                />
                {goal.label}
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div className="actions">
        <button className="action-button" onClick={() => setShowTarot(true)}>
          ✨ Tarot Draw
        </button>
        <button className="action-button">[SHOP]</button>
        <button className="action-button">[INVENTORY]</button>
        <button className="action-button">[ENTER DOGFIGHT]</button>
        <button className="action-button" onClick={() => navigate("/budgeting")}>[BUDGETING]</button>
      </div>

      <div className="footer">
        <span>Coins: {petData.coins}</span>
        <span>Prestige: {petData.prestige}</span>
      </div>

      {showTarot && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-button" onClick={() => setShowTarot(false)}>
              ×
            </button>
            <TarotDraw petData={petData} setPetData={setPetData} />
          </div>
        </div>
      )}
    </div>
  )
}

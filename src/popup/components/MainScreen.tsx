import React, { useState, useEffect, useRef } from 'react';
import { PetData } from '../types';
import { savePetData } from '../storage';
import TarotDraw from './TarotDraw';
import WelcomePopup from './WelcomePopup';
import PetMood from './PetMood';
import PetSprite from './PetSprite';
import { useNavigate } from 'react-router-dom';
import { MdShoppingCart, MdStars } from 'react-icons/md';
import DeathScreen from './DeathScreen';
import '../styles/MainScreen.css';

interface MainScreenProps {
  petData: PetData;
  setPetData: React.Dispatch<React.SetStateAction<PetData>>;
}

const XP_PER_GOAL = 5;

const HP_COLORS = {
  HIGH: '#4caf50',
  MEDIUM: '#ffeb3b',
  LOW: '#f44336',
  DEFAULT: '#6ac6ff'
};

export default function MainScreen({ petData, setPetData }: MainScreenProps) {
  const navigate = useNavigate();
  const [showTarot, setShowTarot] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [newGoal, setNewGoal] = useState('');
  const animationRef = useRef<number | undefined>(undefined);
  const [displayStats, setDisplayStats] = useState({
    HP: petData.HP,
    morale: petData.morale,
    XP: petData.XP
  });

  useEffect(() => {
    const animate = () => {
      setDisplayStats(prev => {
        const newStats = {
          HP: interpolate(prev.HP, petData.HP, 0.1),
          morale: interpolate(prev.morale, petData.morale, 0.1),
          XP: interpolate(prev.XP, petData.XP, 0.1)
        };
        
        // Continue animation if we haven't reached the target values
        if (Math.abs(newStats.HP - petData.HP) > 0.1 ||
            Math.abs(newStats.morale - petData.morale) > 0.1 ||
            Math.abs(newStats.XP - petData.XP) > 0.1) {
          animationRef.current = requestAnimationFrame(animate);
        }
        
        return newStats;
      });
    };

    // Start animation when petData changes
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [petData.HP, petData.morale, petData.XP]);

  // Helper function to interpolate between current and target values
  const interpolate = (current: number, target: number, factor: number): number => {
    return current + (target - current) * factor;
  };

  const updatePetData = async (newData: PetData) => {
    setPetData(newData);
    await savePetData(newData);
  };

  const toggleGoal = async (index: number) => {
    const updatedGoals = [...petData.goals];
    const wasCompleted = updatedGoals[index].completed;
    updatedGoals[index].completed = !wasCompleted;

    const XPChange = wasCompleted ? -XP_PER_GOAL : XP_PER_GOAL;
    const moraleChange = wasCompleted ? -5 : 5;

    const newData = {
      ...petData,
      goals: updatedGoals,
      XP: Math.min(100, Math.max(0, petData.XP + XPChange)),
      morale: Math.min(100, Math.max(0, petData.morale + moraleChange))
    };

    await updatePetData(newData);
  };

  const addGoal = async () => {
    if (newGoal.trim()) {
      const newData = {
        ...petData,
        goals: [...petData.goals, { label: newGoal.trim(), completed: false }]
      };
      await updatePetData(newData);
      setNewGoal('');
    }
  };

  const removeGoal = async (index: number) => {
    const updatedGoals = [...petData.goals];
    updatedGoals.splice(index, 1);
    await updatePetData({ ...petData, goals: updatedGoals });
  };

  const ProgressBar = ({ label, value, displayValue }: { label: string; value: number; displayValue: number }) => {
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
              width: `${displayValue}%`,
              backgroundColor,
              transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
            }} 
          />
        </div>
      </div>
    );
  };

  return petData.HP <= 0 ? (
    <DeathScreen petData={petData} setPetData={setPetData} />
  ) : (
    <div className="main-screen">
      {showWelcome && <WelcomePopup petData={petData} onClose={() => setShowWelcome(false)} />}

      <h2 className="mainscreenheader">✨ {petData.name} ✨</h2>

      <PetSprite petData={petData} setPetData={setPetData} />

      <PetMood petData={petData} />

      <div className="stats">
        <ProgressBar label="HP" value={petData.HP} displayValue={displayStats.HP} />
        <ProgressBar label="Morale" value={petData.morale} displayValue={displayStats.morale} />
        <ProgressBar label="XP" value={petData.XP} displayValue={displayStats.XP} />
      </div>

      <div className="goals">
        <h3>🌟 Daily Goals 🌟</h3>
        <div className="goal-input">
          <input
            type="text"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            placeholder="✨ Add a new goal..."
            onKeyDown={(e) => e.key === 'Enter' && addGoal()}
          />
          <button onClick={addGoal} className="add-button">✨ Add</button>
        </div>
        <ul className="goal-list">
          {petData.goals.map((goal, i) => (
            <li key={i} className={`goal-item ${goal.completed ? 'completed' : ''}`}>
              <label>
                <input type="checkbox" checked={goal.completed} onChange={() => toggleGoal(i)} />
                <span>{goal.label}</span>
                <button className="remove-goal" onClick={() => removeGoal(i)}>×</button>
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div className="actions">
        <button onClick={() => setShowTarot(true)} className="action-button tarot">
          <MdStars /> Tarot Draw
        </button>
        <button onClick={() => navigate('/shop')} className="action-button shop">
          <MdShoppingCart /> Shop
        </button>
      </div>

      <div className="footer">
        <span className="coins">💰 Coins: {petData.coins}</span>
        <span className="prestige">🏆 Prestige: {petData.prestige}</span>
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
  );
}
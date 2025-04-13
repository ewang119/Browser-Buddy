// src/popup/components/MainScreen.tsx
import React, { useState, useEffect } from 'react'
import { PetData } from '../types'
import TarotDraw from './TarotDraw'
import WelcomePopup from './WelcomePopup'
import PetMood from './PetMood'
import '../styles/MainScreen.css'
import { savePetData } from '../storage'

interface MainScreenProps {
  petData: PetData;
  setPetData: (data: PetData) => void;
}

const XP_PER_GOAL = 5;
const DAILY_XP_TARGET = 100;
const WORK_TIME = 25 * 60; // 25 minutes in seconds
const BREAK_TIME = 5 * 60; // 5 minutes in seconds
const XP_PER_SESSION = 10; // XP reward for completing a work session
const BREAK_PENALTY = 5; // HP/morale penalty for skipping breaks
const BREAK_CHECK_INTERVAL = 60 * 1000; // Check for overdue breaks every minute

const MainScreen: React.FC<MainScreenProps> = ({ petData, setPetData }) => {
  const [showTarot, setShowTarot] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [newGoal, setNewGoal] = useState('');
  
  // Initialize timer state from petData or defaults
  const [timeLeft, setTimeLeft] = useState(petData.timerState?.timeLeft ?? WORK_TIME);
  const [isRunning, setIsRunning] = useState(petData.timerState?.isRunning ?? false);
  const [isBreak, setIsBreak] = useState(petData.timerState?.isBreak ?? false);
  const [sessionCompleted, setSessionCompleted] = useState(petData.timerState?.sessionCompleted ?? false);
  const [lastBreakTime, setLastBreakTime] = useState(petData.timerState?.lastBreakTime ?? Date.now());

  // Update timer state in petData whenever it changes
  useEffect(() => {
    const newData = {
      ...petData,
      timerState: {
        timeLeft,
        isRunning,
        isBreak,
        sessionCompleted,
        lastBreakTime,
        lastUpdate: Date.now()
      }
    };
    updatePetData(newData);
  }, [timeLeft, isRunning, isBreak, sessionCompleted, lastBreakTime]);

  // Calculate elapsed time when component mounts
  useEffect(() => {
    if (isRunning) {
      const now = Date.now();
      const elapsed = Math.floor((now - (petData.timerState?.lastUpdate ?? now)) / 1000);
      if (elapsed > 0) {
        setTimeLeft(prev => Math.max(0, prev - elapsed));
      }
    }
  }, []);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  }, []);

  // Check for overdue breaks
  useEffect(() => {
    const checkBreak = () => {
      const now = Date.now();
      const timeSinceLastBreak = now - lastBreakTime;
      const shouldHaveTakenBreak = timeSinceLastBreak > WORK_TIME * 1000;

      if (shouldHaveTakenBreak && !isBreak) {
        // Reduce HP and morale for skipping breaks
        const newData = {
          ...petData,
          HP: Math.max(0, petData.HP - BREAK_PENALTY),
          morale: Math.max(0, petData.morale - BREAK_PENALTY)
        };
        updatePetData(newData);

        // Show notification
        if (Notification.permission === 'granted') {
          new Notification('Time for a break!', {
            body: 'Your pet needs a rest. Take a 5-minute break to keep them happy!',
            icon: '/animal-gifs/' + petData.animalType + '.gif'
          });
        }
      }
    };

    const interval = setInterval(checkBreak, BREAK_CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, [lastBreakTime, isBreak]);

  // Pomodoro timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      setSessionCompleted(true);
      if (!isBreak) {
        // Work session completed
        const newXP = Math.min(petData.XP + XP_PER_SESSION, DAILY_XP_TARGET);
        const newData = {
          ...petData,
          XP: newXP,
          morale: Math.min(100, petData.morale + 10),
          HP: Math.min(100, petData.HP + 5)
        };
        updatePetData(newData);

        // Show break notification
        if (Notification.permission === 'granted') {
          new Notification('Time for a break!', {
            body: 'Great work! Take a 5-minute break to recharge.',
            icon: '/animal-gifs/' + petData.animalType + '.gif'
          });
        }
      } else {
        // Break completed
        setLastBreakTime(Date.now());
        const newData = {
          ...petData,
          morale: Math.min(100, petData.morale + 5),
          HP: Math.min(100, petData.HP + 10)
        };
        updatePetData(newData);

        // Show work notification
        if (Notification.permission === 'granted') {
          new Notification('Break time over!', {
            body: 'Ready to get back to work?',
            icon: '/animal-gifs/' + petData.animalType + '.gif'
          });
        }
      }
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, isBreak]);

  const updatePetData = async (newData: PetData) => {
    setPetData(newData);
    await savePetData(newData);
  };

  const toggleGoal = async (index: number) => {
    const updatedGoals = [...petData.goals];
    const wasCompleted = updatedGoals[index].completed;
    updatedGoals[index].completed = !wasCompleted;
    
    if (!wasCompleted) {
      // When completing a goal, add XP and remove it
      const newXP = Math.min(petData.XP + XP_PER_GOAL, DAILY_XP_TARGET);
      const newData = {
        ...petData,
        goals: updatedGoals.filter((_, i) => i !== index),
        XP: newXP,
        morale: Math.min(100, petData.morale + 5) // Increase morale when completing goals
      };
      await updatePetData(newData);
    } else {
      // When uncompleting a goal, just update the completion status
      const newData = {
        ...petData,
        goals: updatedGoals,
        XP: Math.max(0, petData.XP - XP_PER_GOAL),
        morale: Math.max(0, petData.morale - 5) // Decrease morale when uncompleting goals
      };
      await updatePetData(newData);
    }
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
    
    const newData = {
      ...petData,
      goals: updatedGoals
    };
    await updatePetData(newData);
  };

  const startTimer = () => {
    setIsRunning(true);
    setSessionCompleted(false);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(isBreak ? BREAK_TIME : WORK_TIME);
    setSessionCompleted(false);
  };

  const switchMode = () => {
    setIsBreak(!isBreak);
    setTimeLeft(!isBreak ? BREAK_TIME : WORK_TIME);
    setIsRunning(false);
    setSessionCompleted(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const ProgressBar = ({ value, max, label }: { value: number; max: number; label: string }) => (
    <div className="bar">
      <span>{label}: {value}/{max}</span>
      <div className="track">
        <div className="fill" style={{ width: `${(value / max) * 100}%` }} />
      </div>
    </div>
  );

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

      <PetMood petData={petData} />

      <div className="stats">
        <ProgressBar value={petData.HP} max={100} label="HP" />
        <ProgressBar value={petData.morale} max={100} label="Morale" />
        <ProgressBar value={petData.XP} max={100} label="XP" />
      </div>

      <div className="goals">
        <h3>Daily Goals</h3>
        <div className="goal-input">
          <input
            type="text"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            placeholder="Add a new goal..."
            onKeyPress={(e) => e.key === 'Enter' && addGoal()}
          />
          <button onClick={addGoal}>Add</button>
        </div>
        <ul>
          {petData.goals.map((goal, index) => (
            <li key={index}>
              <label>
                <input
                  type="checkbox"
                  checked={goal.completed}
                  onChange={() => toggleGoal(index)}
                />
                <span className={goal.completed ? 'completed' : ''}>{goal.label}</span>
                <button 
                  className="remove-goal"
                  onClick={() => removeGoal(index)}
                >
                  ×
                </button>
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div className="pomodoro-timer">
        <h3>{isBreak ? 'Break Time' : 'Work Time'}</h3>
        <div className="timer-display">{formatTime(timeLeft)}</div>
        <div className="timer-controls">
          {!sessionCompleted ? (
            <>
              <button 
                className="timer-button" 
                onClick={isRunning ? pauseTimer : startTimer}
              >
                {isRunning ? 'Pause' : 'Start'}
              </button>
              <button className="timer-button" onClick={resetTimer}>Reset</button>
            </>
          ) : (
            <button className="timer-button" onClick={switchMode}>
              Start {isBreak ? 'Work' : 'Break'}
            </button>
          )}
        </div>
        {sessionCompleted && (
          <div className="session-complete">
            {isBreak ? 'Break completed! Ready to work?' : 'Great work! Time for a break!'}
          </div>
        )}
        {!isBreak && !sessionCompleted && (
          <div className="break-reminder">
            Next break in: {formatTime(Math.max(0, WORK_TIME - timeLeft))}
          </div>
        )}
      </div>

      <div className="actions">
        <button className="action-button" onClick={() => setShowTarot(true)}>
          ✨ Tarot Draw
        </button>
        <button className="action-button">[SHOP]</button>
        <button className="action-button">[INVENTORY]</button>
        <button className="action-button">[ENTER DOGFIGHT]</button>
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

export default MainScreen;

import React, { useState, useEffect } from 'react'
import { PetData } from '../types'
import { savePetData } from '../storage'
import TarotDraw from './TarotDraw'
import WelcomePopup from './WelcomePopup'
import PetMood from './PetMood'
import PetSprite from './PetSprite'
import { useNavigate } from 'react-router-dom'
import { MdShoppingCart } from 'react-icons/md'
import '../styles/MainScreen.css'

interface MainScreenProps {
  petData: PetData
  setPetData: React.Dispatch<React.SetStateAction<PetData>>
}

const XP_PER_GOAL = 5
const DAILY_XP_TARGET = 100
const WORK_TIME = 25 * 60
const BREAK_TIME = 5 * 60
const XP_PER_SESSION = 10
const BREAK_CHECK_INTERVAL = 60 * 1000

const HP_COLORS = {
  HIGH: '#4caf50',
  MEDIUM: '#ffeb3b',
  LOW: '#f44336',
  DEFAULT: '#6ac6ff'
}

const BREAK_MESSAGES = {
  TAKE_BREAK: 'Breaks are important!',
  TIME_TO_BREAK: 'Time to take a break! Park your cursor to care for your pet!',
  PENALTY: 'Your pet is exhausted! Take a break!'
}

const MainScreen: React.FC<MainScreenProps> = ({ petData, setPetData }) => {
  const navigate = useNavigate()
  const [showTarot, setShowTarot] = useState(false)
  const [showWelcome, setShowWelcome] = useState(true)
  const [breakMessage, setBreakMessage] = useState(BREAK_MESSAGES.TAKE_BREAK)
  const [newGoal, setNewGoal] = useState('')

  const [timeLeft, setTimeLeft] = useState(petData.timerState?.timeLeft ?? WORK_TIME)
  const [isRunning, setIsRunning] = useState(petData.timerState?.isRunning ?? false)
  const [isBreak, setIsBreak] = useState(petData.timerState?.isBreak ?? false)
  const [sessionCompleted, setSessionCompleted] = useState(petData.timerState?.sessionCompleted ?? false)
  const [lastBreakTime, setLastBreakTime] = useState(petData.timerState?.lastBreakTime ?? Date.now())

  const updatePetData = async (newData: PetData) => {
    setPetData(newData)
    await savePetData(newData)
  }

  useEffect(() => {
    const now = Date.now()
    const nextBreak = petData.nextBreak
    if (petData.isOnBreak) {
      const remaining = Math.max(0, Math.ceil((petData.lastBreak + 60 * 1000 - now) / 1000))
      setBreakMessage(`Take a break! Leave your cursor for: ${remaining}s`)
    } else if (nextBreak <= now - 3600000) {
      setBreakMessage(BREAK_MESSAGES.PENALTY)
    } else if (nextBreak <= now) {
      setBreakMessage(BREAK_MESSAGES.TIME_TO_BREAK)
    } else {
      const mins = Math.max(0, Math.ceil((nextBreak - now) / 1000 / 60))
      setBreakMessage(`Next break in: ${mins} minute${mins !== 1 ? 's' : ''}`)
    }
  }, [petData])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      setIsRunning(false)
      setSessionCompleted(true)
      if (!isBreak) {
        updatePetData({
          ...petData,
          XP: Math.min(petData.XP + XP_PER_SESSION, DAILY_XP_TARGET),
          HP: Math.min(100, petData.HP + 5),
          morale: Math.min(100, petData.morale + 10)
        })
        if (Notification.permission === 'granted') {
          new Notification('Time for a break!', {
            body: 'Great work! Take a 5-minute break to recharge.',
            icon: `/animal-gifs/${petData.animalType}.gif`
          })
        }
      } else {
        setLastBreakTime(Date.now())
        updatePetData({
          ...petData,
          HP: Math.min(100, petData.HP + 10),
          morale: Math.min(100, petData.morale + 5)
        })
        if (Notification.permission === 'granted') {
          new Notification('Break time over!', {
            body: 'Ready to get back to work?',
            icon: `/animal-gifs/${petData.animalType}.gif`
          })
        }
      }
    }
    return () => clearInterval(timer)
  }, [isRunning, timeLeft, isBreak])

  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission()
    }
  }, [])

  const startTimer = () => {
    setIsRunning(true)
    setSessionCompleted(false)
  }

  const pauseTimer = () => setIsRunning(false)

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(isBreak ? BREAK_TIME : WORK_TIME)
    setSessionCompleted(false)
  }

  const switchMode = () => {
    setIsBreak(!isBreak)
    setTimeLeft(!isBreak ? BREAK_TIME : WORK_TIME)
    setIsRunning(false)
    setSessionCompleted(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const toggleGoal = async (index: number) => {
    const updatedGoals = [...petData.goals]
    const wasCompleted = updatedGoals[index].completed
    updatedGoals[index].completed = !wasCompleted

    const XPChange = wasCompleted ? -XP_PER_GOAL : XP_PER_GOAL
    const moraleChange = wasCompleted ? -5 : 5

    const newData = {
      ...petData,
      goals: wasCompleted ? updatedGoals : updatedGoals.filter((_, i) => i !== index),
      XP: Math.min(100, Math.max(0, petData.XP + XPChange)),
      morale: Math.min(100, Math.max(0, petData.morale + moraleChange))
    }

    await updatePetData(newData)
  }

  const addGoal = async () => {
    if (newGoal.trim()) {
      const newData = {
        ...petData,
        goals: [...petData.goals, { label: newGoal.trim(), completed: false }]
      }
      await updatePetData(newData)
      setNewGoal('')
    }
  }

  const removeGoal = async (index: number) => {
    const updatedGoals = [...petData.goals]
    updatedGoals.splice(index, 1)
    await updatePetData({ ...petData, goals: updatedGoals })
  }

  const ProgressBar = ({ label, value }: { label: string; value: number }) => {
    let backgroundColor = HP_COLORS.DEFAULT
    if (label === 'HP' || label === 'Morale') {
      if (value > 70) backgroundColor = HP_COLORS.HIGH
      else if (value > 30) backgroundColor = HP_COLORS.MEDIUM
      else backgroundColor = HP_COLORS.LOW
    }
    return (
      <div className="bar">
        <span>{label}</span>
        <div className="track">
          <div className="fill" style={{ width: `${value}%`, backgroundColor }} />
        </div>
      </div>
    )
  }

  return (
    <div className="main-screen">
      {showWelcome && <WelcomePopup petData={petData} onClose={() => setShowWelcome(false)} />}

      <h2 className="header">Lv. 1 {petData.name}</h2>

      <PetSprite petData={petData} setPetData={setPetData} />

      <p className="break-timer">{breakMessage}</p>

      <PetMood petData={petData} />

      <div className="stats">
        <ProgressBar label="HP" value={petData.HP} />
        <ProgressBar label="Morale" value={petData.morale} />
        <ProgressBar label="XP" value={petData.XP} />
      </div>

      <div className="goals">
        <h3>Daily Goals</h3>
        <div className="goal-input">
          <input
            type="text"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            placeholder="Add a new goal..."
            onKeyDown={(e) => e.key === 'Enter' && addGoal()}
          />
          <button onClick={addGoal}>Add</button>
        </div>
        <ul>
          {petData.goals.map((goal, i) => (
            <li key={i}>
              <label>
                <input type="checkbox" checked={goal.completed} onChange={() => toggleGoal(i)} />
                <span className={goal.completed ? 'completed' : ''}>{goal.label}</span>
                <button className="remove-goal" onClick={() => removeGoal(i)}>×</button>
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
              <button onClick={isRunning ? pauseTimer : startTimer}>
                {isRunning ? 'Pause' : 'Start'}
              </button>
              <button onClick={resetTimer}>Reset</button>
            </>
          ) : (
            <button onClick={switchMode}>Start {isBreak ? 'Work' : 'Break'}</button>
          )}
        </div>
        {sessionCompleted && (
          <div className="session-complete">
            {isBreak ? 'Break completed! Ready to work?' : 'Great work! Time for a break!'}
          </div>
        )}
      </div>

      <div className="actions">
        <button onClick={() => setShowTarot(true)}>✨ Tarot Draw</button>
        <button onClick={() => navigate('/shop')}>
          <MdShoppingCart className="shoppingCart" /> Shop
        </button>
        <button>[INVENTORY]</button>
        <button>[ENTER DOGFIGHT]</button>
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

export default MainScreen

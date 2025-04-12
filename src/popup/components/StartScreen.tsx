// src/popup/components/StartScreen.tsx

import { useState } from 'react'
import type { PetData } from '../types'
import { savePetData } from '../storage'
import '../styles/StartScreen.css'

type Props = {
  setPetData: (data: PetData) => void
}

export default function StartScreen({ setPetData }: Props) {
  const [name, setName] = useState('')
  const [animalType, setAnimalType] = useState('cat')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Please enter a name for your pet')
      return
    }

    try {
      const now = Date.now()
      const data: PetData = {
        animalType,
        name,
        lastBreak: now,
        nextBreak: now + 3600000,
        budget: 100,
        coins: 0,
        goals: [
          { label: 'Drink water', completed: false },
          { label: 'Take a walk', completed: false }
        ],
        streaks: 0,
        prestige: 0,
        HP: 100,
        morale: 100,
        XP: 0,
        highScore: 0
      }

      await savePetData(data)
      setPetData(data)
    } catch (error) {
      console.error('Error saving pet data:', error)
      setError('Failed to save pet data. Please try again.')
    }
  }

  return (
    <div className="start-screen">
      <h2>Welcome to Browser Pet!</h2>

      {error && <p className="error-message">{error}</p>}

      <label>
        Name your pet:
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Mochi"
        />
      </label>

      <label>
        Choose animal:
        <select value={animalType} onChange={(e) => setAnimalType(e.target.value)}>
          <option value="cat">Cat</option>
          <option value="dog">Dog</option>
        </select>
      </label>

      <button onClick={handleSubmit}>Start!</button>
    </div>
  )
}
